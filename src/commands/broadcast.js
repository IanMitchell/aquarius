const debug = require('debug');
const triggers = require('../util/triggers');
const permissions = require('../util/permissions');

const log = debug('Broadcast');

const message = msg => {
  if (permissions.isBotOwner(msg.author)) {
    if (triggers.messageTriggered(msg, /^broadcast .+$/)) {
      const broadcast = msg.content.split('broadcast ');
      log(`Broadcasting '${broadcast[1]}'`);

      msg.client.servers.forEach(server => {
        server.client.sendMessage(server.defaultChannel, `BROADCAST: ${broadcast[1]}`);
      });

      return 'Message broadcasted.';
    }
  }

  return false;
};

module.exports = {
  name: 'broadcast',
  help: '`@bot broadcast message`. Broadcasts a bot admin message to all servers.',
  message,
};
