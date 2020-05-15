import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION_USER } from '@aquarius-bot/regex';
import Sentry from '@aquarius-bot/sentry';
import { messageTriggered } from '@aquarius-bot/triggers';
import { getNickname } from '@aquarius-bot/users';
import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import { ONE_WEEK } from '../../core/helpers/times';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Karma');

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

async function updateKarma(aquarius, guild, receiver, giver, amount) {
  const update = await aquarius.database.karma.upsert({
    select: {
      karma: true,
    },
    create: {
      userId: receiver,
      guildId: guild,
      karma: 1,
      lastUsage: Date.now() - ONE_WEEK,
    },
    update: {
      karma: karma + amount, // TODO: Wait for prisma to support ops
    },
    where: {
      userId: receiver,
      guildId: guild,
    },
  });

  await aquarius.database.karma.upsert({
    create: {
      userId: giver,
      guildId: guild,
    },
    update: {
      lastUsage: Date.now(),
    },
    where: {
      userId: giver,
      guildId: guild,
    },
  });

  return update;
}

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
    let val = parseInt(settings.get(guild.id, 'cooldown'), 10);

    if (Number.isNaN(val)) {
      val = COOLDOWN.DEFAULT;
    }

    return Math.max(COOLDOWN.MIN, val) * 1000;
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
        first: 5,
      });

      if (!list.length) {
        message.channel.send(
          'It appears no one in this server has any karma yet!'
        );
        return;
      }

      // TODO: Convert into MessageEmbed
      const entries = list.map(async (row, idx) => {
        const user = await aquarius.users.fetch(row.userId);
        const nickname = getNickname(message.guild, user);
        return `${idx + 1}. ${nickname} - ${row.karma} ${name}`;
      });

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
          userId: user.id,
          guildId: message.guild.id,
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
            userId: message.author.id,
            guildId: message.guild.id,
          },
        });

        if (giver && cooldown > Date.now() - giver.lastUsage) {
          log('Karma cooldown');
          message.channel.send(
            `You need to wait ${formatDistance(
              Date.now(),
              giver.lastUsage + cooldown
            )} to give ${name}!`
          );
          return;
        }

        const receiver = await updateKarma(
          aquarius,
          message.guild.id,
          user.id,
          message.author.id,
          1
        );
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
            userId: message.author.id,
            guildId: message.guild.id,
          },
        });

        if (giver && cooldown > Date.now() - giver.lastUsage) {
          log('Karma cooldown');
          message.channel.send(
            `You need to wait ${formatDistance(
              Date.now(),
              giver.lastUsage + cooldown
            )} to take ${name}!`
          );
          return;
        }

        const receiver = await updateKarma(
          aquarius,
          message.guild.id,
          user.id,
          message.author.id,
          -1
        );
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
