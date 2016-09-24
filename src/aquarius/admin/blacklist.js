const debug = require('debug');
const client = require('../core/client');

const log = debug('Blacklist');

const BLACKLIST = [
  '83056679066796032',
];

function blacklist() {
  client.guilds.array().forEach(guild => {
    if (BLACKLIST.includes(guild.id)) {
      log(`Leaving ${guild.name}`);

      guild.leave();
    }
  });
}


client.on('guildCreated', blacklist);
client.on('ready', blacklist);
