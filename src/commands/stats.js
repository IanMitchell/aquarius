const debug = require('debug');
const moment = require('moment');
const triggers = require('../util/triggers');
const permissions = require('../util/permissions');

const log = debug('Stats');

const message = msg => {
  if (triggers.messageTriggered(msg, /^uptime$/i)) {
    log(`Uptime called: ${msg.client.uptime}ms`);
    const uptime = moment(Date.now() - msg.client.uptime).fromNow(true);
    return `Aquarius has been up for ${uptime}`;
  }

  if (triggers.messageTriggered(msg, /^servers$/i)) {
    if (permissions.isBotOwner(msg.author)) {
      const count = msg.client.servers.length;
      log(`Server count: ${count}`);
      return `${msg.client.user.name} is in ${count} servers.`;
    }
  }

  return false;
};

module.exports = {
  name: 'stats',
  help: 'Stats displays certain stats about the bot.',
  message,
};
