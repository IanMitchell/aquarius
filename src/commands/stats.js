const debug = require('debug');
const permissions = require('../util/permissions');

const log = debug('Stats');

const triggered = msg => {
  if (msg.cleanContent.toLowerCase() === '@aquarius server stats') {
    if (permissions.isBotOwner(msg.author)) {
      log('Server stats requested');
      return true;
    }
  }

  return false;
};

const message = msg => {
  const count = msg.client.servers.length;
  log(`Server count: ${count}`);
  return `I am in ${count} servers.`;
};

module.exports = {
  name: 'stats',
  help: 'Stats displays certain stats about the bot.',
  triggered,
  message,
};
