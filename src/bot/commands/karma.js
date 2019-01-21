import debug from 'debug';
import dedent from 'dedent-js';
import { formatDistance } from 'date-fns';
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
  `,
};

const COOLDOWN = {
  MIN: 1,
  DEFAULT: 60 * 5,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  settings.register('name', 'Name for the Karma command in your guild', 'Karma');
  settings.register('cooldown', 'Timeout in seconds before a user can use the command again', COOLDOWN.DEFAULT);

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
      return aquarius.triggers.messageTriggered(message, regex);
    },
    async (message) => {
      log('Leaderboard requested');

      const name = settings.get(message.guild.id, 'name');

      const rows = await aquarius.database.karma
        .findAsCursor({ guildId: message.guild.id })
        .sort({ karma: -1 })
        .limit(5)
        .toArray();

      if (rows.length === 0) {
        message.channel.send('It appears no one in this server has any karma yet!');
        return;
      }

      // TODO: Convert into RichEmbed
      const entries = rows.reduce(
        (val, row, idx) => {
          const nickname = getNickname(message.guild, aquarius.users.get(row.userId));
          return val + `${idx + 1}. ${nickname} - ${row.karma} ${name}\n`;
        },
        ''
      );

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
    (message) => {
      const name = settings.get(message.guild.id, 'name');
      const regex = new RegExp(`^(?:karma|${name}) ${MENTION_USER}$`, 'i');
      return aquarius.triggers.messageTriggered(message, regex);
    },
    async (message) => {
      const user = message.mentions.users.first();

      if (user === undefined) {
        return;
      }

      log(`Karma lookup for ${user.username}`);

      const name = settings.get(message.guild.id, 'name');

      const row = await aquarius.database.karma.find({
        guildId: message.guild.id,
        userId: user.id,
      });

      const str = row
        ? `${getNickname(message.guild, user)} has ${row.karma} ${name}`
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
      const user = message.mentions.users.first();

      if (!user) {
        return;
      }

      const name = settings.get(message.guild.id, 'name');
      const cooldown = getCooldown(message.guild);

      if (user === message.author && !aquarius.permissions.isBotOwner(message.author)) {
        message.channel.send(`You cannot give ${name} to yourself!`);
        return;
      }

      log(`${message.author.username} gave karma to ${user.username}`);

      try {
        const giver = await aquarius.database.karma.findAndModify({
          query: {
            userId: message.author.id,
            guildId: message.guild.id,
          },
          update: {
            $setOnInsert: {
              userId: message.author.id,
              guildId: message.guild.id,
              karma: 0,
              lastUsage: 0,
            },
          },
          new: true,
          upsert: true,
        });

        if (cooldown > Date.now() - giver.lastUsage) {
          log('Karma cooldown');
          message.channel.send(`You need to wait ${formatDistance(Date.now(), giver.lastUsage + cooldown)} to give ${name}!`);
          return;
        }

        const receiver = await aquarius.database.karma.findAndModify({
          query: {
            userId: user.id,
            guildId: message.guild.id,
          },
          update: {
            $setOnInsert: {
              userId: user.id,
              guildId: message.guild.id,
              lastUsage: 0,
            },
            $inc: {
              karma: 1,
            },
          },
          new: true,
          upsert: true,
        });

        const nickname = await getNickname(message.guild, user);
        message.channel.send(`${name} given! ${nickname} now has ${receiver.karma} ${name}.`);
        analytics.trackUsage('increase', message);

        aquarius.database.karma.findAndModify({
          query: {
            userId: message.author.id,
            guildId: message.guild.id,
          },
          update: {
            $set: { lastUsage: Date.now() },
          },
        });
      } catch (error) {
        log(error);
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
      const user = message.mentions.users.first();

      if (!user) {
        return;
      }

      const name = settings.get(message.guild.id, 'name');
      const cooldown = getCooldown(message.guild);

      if (user === message.author && !aquarius.permissions.isBotOwner(message.author)) {
        message.channel.send(`You cannot take ${name} to yourself!`);
        return;
      }

      log(`${message.author.username} took karma from ${user.username}`);

      try {
        const giver = await aquarius.database.karma.findAndModify({
          query: {
            userId: message.author.id,
            guildId: message.guild.id,
          },
          update: {
            $setOnInsert: {
              userId: message.author.id,
              guildId: message.guild.id,
              karma: 0,
              lastUsage: 0,
            },
          },
          new: true,
          upsert: true,
        });

        if (cooldown > Date.now() - giver.lastUsage) {
          log('Karma cooldown');
          message.channel.send(`You need to wait ${formatDistance(Date.now(), giver.lastUsage + cooldown)} to take ${name}!`);
          return;
        }

        const receiver = await aquarius.database.karma.findAndModify({
          query: {
            userId: user.id,
            guildId: message.guild.id,
          },
          update: {
            $setOnInsert: {
              userId: user.id,
              guildId: message.guild.id,
              lastUsage: 0,
            },
            $inc: {
              karma: -1,
            },
          },
          new: true,
          upsert: true,
        });

        const nickname = await getNickname(message.guild, user);
        message.channel.send(`${name} taken! ${nickname} now has ${receiver.karma} ${name}.`);
        analytics.trackUsage('decrease', message);

        aquarius.database.karma.findAndModify({
          query: {
            userId: message.author.id,
            guildId: message.guild.id,
          },
          update: {
            $set: { lastUsage: Date.now() },
          },
        });
      } catch (error) {
        log(error);
      }
    }
  );
};
