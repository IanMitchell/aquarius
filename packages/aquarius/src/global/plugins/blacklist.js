import debug from 'debug';

const log = debug('Blacklist');

export const info = {
  name: 'blacklist',
  hidden: true,
  description: 'Prevents the bot from joining blacklisted servers.',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  const checkBlacklist = async () => {
    log('Checking Guild Blacklist');
    aquarius.guilds.array().forEach((guild) => {
      if (aquarius.config.blacklist.includes(guild.id)) {
        log(`Leaving ${guild.name}`);
        guild.leave();

        analytics.trackUsage('blacklist leave', null, {
          guild: {
            name: guild.name,
            id: guild.id,
          },
        });
      }
    });
  };

  aquarius.on('guildCreate', checkBlacklist);
  aquarius.on('ready', checkBlacklist);
};
