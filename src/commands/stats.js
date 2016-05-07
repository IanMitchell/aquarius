const debug = require('debug');
const moment = require('moment');
const permissions = require('../util/permissions');

const log = debug('Stats');

const message = msg => {
  const botMention = msg.client.user.mention().toLowerCase();

  if (msg.content.toLowerCase() === `${botMention} servers`) {
    if (permissions.isBotOwner(msg.author)) {
      const count = msg.client.servers.length;
      log(`Server count: ${count}`);
      return `Aquarius is in ${count} servers.`;
    }
  }

  if (msg.content.toLowerCase() === `${botMention} uptime`) {
    log(`Uptime called: ${msg.client.uptime}ms`);
    const uptime = moment(Date.now() - msg.client.uptime).fromNow(true);
    return `Aquarius has been up for ${uptime}`;
  }


  return false;
};

module.exports = {
  name: 'stats',
  help: 'Stats displays certain stats about the bot.',
  message,
};
