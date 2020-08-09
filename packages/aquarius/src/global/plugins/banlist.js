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

  aquarius.on('guildCreate', checkBanlist);
  aquarius.on('ready', checkBanlist);
};
