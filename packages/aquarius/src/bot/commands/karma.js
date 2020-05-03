import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION_USER } from '@aquarius-bot/regex';
import Sentry from '@aquarius-bot/sentry';
import { messageTriggered } from '@aquarius-bot/triggers';
import { getNickname } from '@aquarius-bot/users';
import { PrismaClient } from '@prisma/client';
import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Karma');
const prisma = new PrismaClient();

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

      const list = await aquarius.database.karma
        .where('guildId', '==', message.guild.id)
        .orderBy('karma', 'desc')
        .limit(5)
        .get();

      if (list.empty === 0) {
        message.channel.send(
          'It appears no one in this server has any karma yet!'
        );
        return;
      }

      // TODO: Convert into MessageEmbed
      const entries = await Promise.all(
        list.docs.map(async (row, idx) => {
          const data = row.data();
          const user = await aquarius.users.fetch(data.userId);
          const nickname = getNickname(message.guild, user);
          return `${idx + 1}. ${nickname} - ${data.karma} ${name}`;
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

      const recordList = await aquarius.database.karma
        .where('userId', '==', user.id)
        .where('guildId', '==', message.guild.id)
        .get();

      const str = recordList.empty
        ? "They don't have any karma yet!"
        : `${getNickname(message.guild, user)} has ${
            recordList.docs[0].data().karma
          } ${name}`;

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
        const giverList = await aquarius.database.karma
          .where('userId', '==', message.author.id)
          .where('guildId', '==', message.guild.id)
          .get();

        if (giverList.empty) {
          aquarius.database.karma.add({
            userId: message.author.id,
            guildId: message.guild.id,
            lastUsage: Date.now(),
            karma: 0,
          });
        } else {
          const giverDoc = giverList.docs[0];
          const giver = giverDoc.data();

          if (cooldown > Date.now() - giver.lastUsage) {
            log('Karma cooldown');
            message.channel.send(
              `You need to wait ${formatDistance(
                Date.now(),
                giver.lastUsage + cooldown
              )} to give ${name}!`
            );
            return;
          }

          giverDoc.ref.set({ lastUsage: Date.now() }, { merge: true });
        }

        const receiverList = await aquarius.database.karma
          .where('userId', '==', user.id)
          .where('guildId', '==', message.guild.id)
          .get();

        let karma = 1;

        if (receiverList.empty) {
          aquarius.database.karma.add({
            userId: user.id,
            guildId: message.guild.id,
            lastUsage: Date.now(),
            karma,
          });
        } else {
          const receiverDoc = receiverList.docs[0];
          karma += receiverDoc.data().karma;

          receiverDoc.ref.set({ karma }, { merge: true });
        }

        const nickname = await getNickname(message.guild, user);
        message.channel.send(
          `${name} given! ${nickname} now has ${karma} ${name}.`
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
        const giverList = await aquarius.database.karma
          .where('userId', '==', message.author.id)
          .where('guildId', '==', message.guild.id)
          .get();

        if (giverList.empty) {
          prisma.karma.add({
            data: {
              guildId: message.guild.id,
              userId: message.author.id,
              karma: 0,
              lastUsage: Date.now(),
            },
          });
        } else {
          const giverDoc = giverList.docs[0];
          const giver = giverDoc.data();

          if (cooldown > Date.now() - giver.lastUsage) {
            log('Karma cooldown');
            message.channel.send(
              `You need to wait ${formatDistance(
                Date.now(),
                giver.lastUsage + cooldown
              )} to take ${name}!`
            );
            return;
          }

          giverDoc.ref.set({ lastUsage: Date.now() }, { merge: true });
        }

        const receiverList = await aquarius.database.karma
          .where('userId', '==', user.id)
          .where('guildId', '==', message.guild.id)
          .get();

        let karma = -1;

        if (receiverList.empty) {
          aquarius.database.karma.add({
            userId: user.id,
            guildId: message.guild.id,
            lastUsage: Date.now(),
            karma,
          });
        } else {
          const receiverDoc = receiverList.docs[0];
          karma += receiverDoc.data().karma;

          receiverDoc.ref.set({ karma }, { merge: true });
        }

        const nickname = await getNickname(message.guild, user);
        message.channel.send(
          `${name} taken! ${nickname} now has ${karma} ${name}.`
        );
        analytics.trackUsage('decrease', message);
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  );
};
