const debug = require('debug');
const permissions = require('../util/permissions');

const log = debug('Broadcast');

const message = msg => {
  if (permissions.isBotOwner(msg.author)) {
    const botMention = msg.client.user.mention();

    if (msg.content.toLowerCase().startsWith(`${botMention.toLowerCase()} broadcast`)) {
      const broadcast = msg.content.split(`${botMention} broadcast `);
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
