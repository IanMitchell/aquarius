import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Banlist');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'banlist',
  hidden: true,
  description: 'Prevents the bot from joining banned servers.',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  const checkBanlist = async () => {
    log.info('Checking Guild Banlist');
    const list = await aquarius.database.banList.findMany({
      select: { guildId: true },
    });

    list.forEach((entry) => {
      if (aquarius.guilds.cache.has(entry.id)) {
        const guild = aquarius.guilds.cache.get(entry.id);
        log.info(`Leaving ${chalk.green(guild.name)}`);
        guild.leave();

        analytics.trackUsage('banlist leave', null, {
          guild: {
            name: guild.name,
            id: guild.id,
          },
        });
      }
    });
  };

  // TODO: Switch to slash command
  aquarius.onCommand(
    /banlist add (?<input>\d+)(?: (?<reason>.+))?/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log.info(
          `Adding ${chalk.blue(groups.input)} to Banlist`,
          getMessageMeta(message)
        );

        try {
          await aquarius.database.banList.create({
            data: {
              guildId: groups.input,
              reason: groups.reason,
            },
          });

          message.channel.send(`Added ${groups.input} to my banlist.`);
        } catch (error) {
          log.error(error.message);
          Sentry.captureException(error);
          message.channel.send('Sorry, I encountered a problem!');
        }

        analytics.trackUsage('banlist', 'add', message);
      }
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(
    /banlist remove (?<input>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log.info(
          `Removing ${chalk.blue(groups.input)} from Banlist`,
          getMessageMeta(message)
        );

        try {
          await aquarius.database.banList.delete({
            where: {
              guildId: groups.input,
            },
          });

          message.channel.send(`Removed ${groups.input} from my banlist.`);
        } catch (error) {
          log.error(error);
          Sentry.captureException(error);
          message.channel.send('Sorry, I encountered a problem!');
        }

        analytics.trackUsage('banlist', 'remove', message);
      }
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(
    /banlist lookup (?<input>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log.info('List Requested', getMessageMeta(message));

        try {
          const entry = await aquarius.database.banList.findUnique({
            where: { guildId: groups.input },
          });

          if (entry?.reason) {
            message.channel.send(
              `I have that guild banned for: ${entry.reason}`
            );
          } else if (entry) {
            message.channel.send("There isn't a reason for their ban.");
          } else {
            message.channel.send(
              "I wasn't able to find that guild in my banlist."
            );
          }
        } catch (error) {
          log.error(error.message);
          Sentry.captureException(error);
          message.channel.send('Sorry, I encountered a problem!');
        }

        analytics.trackUsage('banlist', 'lookup', message);
      }
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(/banlist count/i, async (message) => {
    if (aquarius.permissions.isBotAdmin(message.author)) {
      log.info('Count Requested', getMessageMeta(message));

      try {
        const count = await aquarius.database.banList.count();

        message.channel.send(`I currently have ${count} entries in my banlist`);
      } catch (error) {
        log.error(error.message);
        Sentry.captureException(error);
        message.channel.send('Sorry, I encountered a problem!');
      }
      analytics.trackUsage('banlist', 'count', message);
    }
  });

  aquarius.on('guildCreate', checkBanlist);
  aquarius.on('ready', checkBanlist);
};
