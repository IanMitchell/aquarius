import debug from 'debug';
import dedent from 'dedent-js';
import { formatDistance } from 'date-fns';
import database from '../../lib/database';
import Sentry from '../../lib/errors/sentry';
import { MENTION_USER } from '../../lib/helpers/regex';
import { getNickname } from '../../lib/core/users';

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

  const getCooldown = guild => {
    let val = parseInt(settings.get(guild.id, 'cooldown'), 10);

    if (Number.isNaN(val)) {
      val = COOLDOWN.DEFAULT;
    }

    return Math.max(COOLDOWN.MIN, val) * 1000;
  };

  // Leaderboard Trigger
  aquarius.onDynamicTrigger(
    info,
    message => {
      const name = settings.get(message.guild.id, 'name');
      const regex = new RegExp(`^(?:karma|${name}) leaderboard$`, 'i');
      return aquarius.triggers.messageTriggered(message, regex);
    },
    async message => {
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

      // TODO: Convert into RichEmbed
      const entries = list.docs.reduce((val, row, idx) => {
        const data = row.data();
        const nickname = getNickname(
          message.guild,
          aquarius.users.get(data.userId)
        );
        return `${val} ${idx + 1}. ${nickname} - ${data.karma} ${name}\n`;
      }, '');

      const str = dedent`
        **${name} Leaderboard**

        ${entries}
      `;

      message.channel.send(str);
      analytics.trackUsage('leaderboard', message);
    }
  );

  // Lookup Trigger
  aquarius.onDynamicTrigger(
    info,
    message => {
      const name = settings.get(message.guild.id, 'name');
      const regex = new RegExp(
        `^(?:karma|${name}) ${MENTION_USER.source}$`,
        'i'
      );
      return aquarius.triggers.messageTriggered(message, regex);
    },
    async message => {
      const user = message.mentions.users.first();

      if (user === undefined) {
        return;
      }

      log(`Karma lookup for ${user.username}`);

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
    message => {
      const regex = new RegExp(`^${MENTION_USER.source} ?\\+\\+.*$`, 'i');
      return message.content.match(regex);
    },
    async message => {
      const user = message.mentions.users.first();

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

      log(`${message.author.username} gave karma to ${user.username}`);

      try {
        const giverList = await database.karma
          .where('userId', '==', message.author.id)
          .where('guildId', '==', message.guild.id)
          .get();

        if (giverList.empty) {
          database.karma.add({
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

        const receiverList = await database.karma
          .where('userId', '==', user.id)
          .where('guildId', '==', message.guild.id)
          .get();

        let karma = 1;

        if (receiverList.empty) {
          database.karma.add({
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
    message => {
      const regex = new RegExp(`^${MENTION_USER.source} ?--.*$`, 'i');
      return message.content.match(regex);
    },
    async message => {
      const user = message.mentions.users.first();

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

      log(`${message.author.username} took karma from ${user.username}`);

      try {
        const giverList = await database.karma
          .where('userId', '==', message.author.id)
          .where('guildId', '==', message.guild.id)
          .get();

        if (giverList.empty) {
          database.karma.add({
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
              )} to take ${name}!`
            );
            return;
          }

          giverDoc.ref.set({ lastUsage: Date.now() }, { merge: true });
        }

        const receiverList = await database.karma
          .where('userId', '==', user.id)
          .where('guildId', '==', message.guild.id)
          .get();

        let karma = -1;

        if (receiverList.empty) {
          database.karma.add({
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
