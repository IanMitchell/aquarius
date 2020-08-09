import debug from 'debug';

const log = debug('Banlist');

export const info = {
  name: 'banlist',
  hidden: true,
  description: 'Prevents the bot from joining banned servers.',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  const checkBanlist = async () => {
    log('Checking Guild Banlist');
    const list = await aquarius.database.banList.findMany({
      select: { guildId: true },
    });

    list.forEach((entry) => {
      if (aquarius.guilds.cache.has(entry.id)) {
        const guild = aquarius.guilds.cache.get(entry.id);
        log(`Leaving ${guild.name}`);
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

  aquarius.onCommand(
    /banlist add (?<input>\d+)(?: (?<reason>.+))?/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log(`Adding ${groups.input} to Banlist`);

        await aquarius.database.banList.create({
          data: {
            guildId: groups.input,
            reason: groups.reason,
          },
        });

        message.channel.send(`Added ${groups.input} to my banlist.`);

        analytics.trackUsage('banlist', 'add', message);
      }
    }
  );

  aquarius.onCommand(
    /banlist remove (?<input>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log(`Removing ${groups.input} from Banlist`);

        await aquarius.database.banList.delete({
          where: {
            guildId: groups.input,
          },
        });

        message.channel.send(`Removed ${groups.input} from my banlist.`);

        analytics.trackUsage('banlist', 'remove', message);
      }
    }
  );

  aquarius.onCommand(
    /banlist lookup (?<input>.+)/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotAdmin(message.author)) {
        log('List Requested');

        const entry = await aquarius.database.banList.findOne({
          where: { guildId: groups.input },
        });

        if (entry?.reason) {
          message.channel.send(`I have that guild banned for: ${entry.reason}`);
        } else if (entry) {
          message.channel.send("There isn't a reason for their ban.");
        } else {
          message.channel.send(
            "I wasn't able to find that guild in my banlist."
          );
        }

        analytics.trackUsage('banlist', 'lookup', message);
      }
    }
  );

  aquarius.onCommand(/banlist count/i, async (message) => {
    if (aquarius.permissions.isBotAdmin(message.author)) {
      log('Count Requested');

      const count = await aquarius.database.banList.count();

      message.channel.send(`I currently have ${count} entries in my banlist`);

      analytics.trackUsage('banlist', 'count', message);
    }
  });

  aquarius.on('guildCreate', checkBanlist);
  aquarius.on('ready', checkBanlist);
};
