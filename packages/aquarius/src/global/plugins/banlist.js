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

    if (list.length === 0) {
      return;
    }

    const ids = list.map((guild) => guild.guildId);

    aquarius.guilds.cache.array().forEach((guild) => {
      if (ids.includes(guild.id)) {
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

  aquarius.on('guildCreate', checkBanlist);
  aquarius.on('ready', checkBanlist);
};
