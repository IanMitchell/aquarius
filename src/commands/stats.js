const debug = require('debug');
const permissions = require('../util/permissions');

const log = debug('Stats');

const message = msg => {
  if (msg.cleanContent.toLowerCase() === '@aquarius server stats') {
    if (permissions.isBotOwner(msg.author)) {
      const count = msg.client.servers.length;
      log(`Server count: ${count}`);
      return `I am in ${count} servers.`;
    }
  }

  return false;
};

module.exports = {
  name: 'stats',
  help: 'Stats displays certain stats about the bot.',
  message,
};
