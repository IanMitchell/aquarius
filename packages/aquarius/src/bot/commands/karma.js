import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION_USER } from '@aquarius-bot/regex';
import Sentry from '@aquarius-bot/sentry';
import { messageTriggered } from '@aquarius-bot/triggers';
import { getNickname } from '@aquarius-bot/users';
import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import { getInputAsNumber } from '../../core/helpers/input';
import { ONE_WEEK } from '../../core/helpers/times';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Karma');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'karma',
  description: 'A Karma system for users in your server.',
  usage: dedent`
    **Karma Leaderboard**
    \`\`\`@Aquarius karma leaderboard\`\`\`

    **Give Karma:**
    \`\`\`<@User> ++ thanks for being my friend\`\`\`

    **Take Karma**
    \`\`\`<@User> -- friends don't do that\`\`\`

    **Lookup Karma**
    \`\`\`@Aquarius karma <@User>\`\`\`
  `,
};

const COOLDOWN = {
  MIN: 1,
  DEFAULT: 60 * 5,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  settings.register(
    'name',
    'Name for the Karma command in your guild',
    'Karma'
  );
  settings.register(
    'cooldown',
    'Timeout in seconds before a user can use the command again',
    COOLDOWN.DEFAULT
  );

  const getCooldown = (guild) => {
    const cooldown =
      getInputAsNumber(settings.get(guild.id, 'cooldown')) ?? COOLDOWN.DEFAULT;

    return Math.max(COOLDOWN.MIN, cooldown) * 1000;
  };

  // Leaderboard Trigger
  aquarius.onDynamicTrigger(
    info,
    (message) => {
      const name = settings.get(message.guild.id, 'name');
      const regex = new RegExp(`^(?:karma|${name}) leaderboard$`, 'i');
      return messageTriggered(message, regex);
    },
    async (message) => {
      log('Leaderboard requested');

      const name = settings.get(message.guild.id, 'name');

      const list = await aquarius.database.karma.findMany({
        select: {
          userId: true,
          karma: true,
        },
        where: {
          guildId: message.guild.id,
        },
        orderBy: {
          karma: 'desc',
        },
        take: 5,
      });

      if (!list.length) {
        message.channel.send(
          'It appears no one in this server has any karma yet!'
        );
        return;
      }

      // TODO: Convert into MessageEmbed
      const entries = await Promise.all(
        list.map(async (row, idx) => {
          const user = await aquarius.users.fetch(row.userId);
          const nickname = getNickname(message.guild, user);
          return `${idx + 1}. ${nickname} - ${row.karma} ${name}`;
        })
      );

      const str = dedent`
        **${name} Leaderboard**

        ${entries.join('\n')}
      `;

      message.channel.send(str);
      analytics.trackUsage('leaderboard', message);
    }
  );

  // Lookup Trigger
  aquarius.onDynamicTrigger(
    info,
    (message) => {
      const name = settings.get(message.guild.id, 'name');
      const regex = new RegExp(
        `^(?:karma|${name}) ${MENTION_USER.source}$`,
        'i'
      );
      return messageTriggered(message, regex);
    },
    async (message) => {
      const [user] = await getOrderedMentions(message);

      if (user === undefined) {
        return;
      }

      log(`Karma lookup for ${getNickname(message.guild, user)}`);

      const name = settings.get(message.guild.id, 'name');

      const record = await aquarius.database.karma.findOne({
        select: {
          karma: true,
        },
        where: {
          guildId_userId: {
            guildId: message.guild.id,
            userId: user.id,
          },
        },
      });

      const str = record
        ? `${getNickname(message.guild, user)} has ${record.karma} ${name}`
        : "They don't have any karma yet!";

      message.channel.send(str);
      analytics.trackUsage('lookup', message);
    }
  );

  // Increase
  aquarius.onDynamicTrigger(
    info,
    (message) => {
      const regex = new RegExp(`^${MENTION_USER.source} ?\\+\\+.*$`, 'i');
      return message.content.match(regex);
    },
    async (message) => {
      const [user] = await getOrderedMentions(message);

      if (!user) {
        return;
      }

      const name = settings.get(message.guild.id, 'name');
      const cooldown = getCooldown(message.guild);

      if (
        user === message.author &&
        !aquarius.permissions.isBotOwner(message.author)
      ) {
        message.channel.send(`You cannot give ${name} to yourself!`);
        return;
      }

      log(
        `${message.author.username} gave karma to ${getNickname(
          message.guild,
          user
        )}`
      );

      try {
        const giver = await aquarius.database.karma.findOne({
          select: {
            lastUsage: true,
          },
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: message.author.id,
            },
          },
        });

        if (giver && cooldown > Date.now() - giver.lastUsage.getTime()) {
          log('Karma cooldown');
          message.channel.send(
            `You need to wait ${formatDistance(
              Date.now(),
              giver.lastUsage.getTime() + cooldown
            )} to give ${name}!`
          );
          return;
        }

        const receiver = await aquarius.database.karma.upsert({
          select: {
            karma: true,
          },
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: user.id,
            },
          },
          create: {
            guildId: message.guild.id,
            userId: user.id,
            karma: 1,
            lastUsage: new Date(Date.now() - ONE_WEEK),
          },
          update: {
            karma: {
              increment: 1,
            },
          },
        });

        await aquarius.database.karma.upsert({
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: message.author.id,
            },
          },
          create: {
            guildId: message.guild.id,
            userId: message.author.id,
          },
          update: {
            lastUsage: new Date(),
          },
        });

        const nickname = await getNickname(message.guild, user);
        message.channel.send(
          `${name} given! ${nickname} now has ${receiver.karma} ${name}.`
        );
        analytics.trackUsage('increase', message);
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  );

  // Decrease
  aquarius.onDynamicTrigger(
    info,
    (message) => {
      const regex = new RegExp(`^${MENTION_USER.source} ?--.*$`, 'i');
      return message.content.match(regex);
    },
    async (message) => {
      const [user] = await getOrderedMentions(message);

      if (!user) {
        return;
      }

      const name = settings.get(message.guild.id, 'name');
      const cooldown = getCooldown(message.guild);

      if (
        user === message.author &&
        !aquarius.permissions.isBotOwner(message.author)
      ) {
        message.channel.send(`You cannot take ${name} from yourself!`);
        return;
      }

      log(
        `${message.author.username} took karma from ${getNickname(
          message.guild,
          user
        )}`
      );

      try {
        const giver = await aquarius.database.karma.findOne({
          select: {
            lastUsage: true,
          },
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: message.author.id,
            },
          },
        });

        if (giver && cooldown > Date.now() - giver.lastUsage.getTime()) {
          log('Karma cooldown');
          message.channel.send(
            `You need to wait ${formatDistance(
              Date.now(),
              giver.lastUsage.getTime() + cooldown
            )} to take ${name}!`
          );
          return;
        }

        const receiver = await aquarius.database.karma.upsert({
          select: {
            karma: true,
          },
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: user.id,
            },
          },
          create: {
            guildId: message.guild.id,
            userId: user.id,
            karma: 1,
            lastUsage: new Date(Date.now() - ONE_WEEK),
          },
          update: {
            karma: {
              decrement: 1,
            },
          },
        });

        await aquarius.database.karma.upsert({
          where: {
            guildId_userId: {
              guildId: message.guild.id,
              userId: message.author.id,
            },
          },
          create: {
            guildId: message.guild.id,
            userId: message.author.id,
          },
          update: {
            lastUsage: new Date(),
          },
        });

        const nickname = await getNickname(message.guild, user);
        message.channel.send(
          `${name} taken! ${nickname} now has ${receiver.karma} ${name}.`
        );
        analytics.trackUsage('decrease', message);
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  );
};
