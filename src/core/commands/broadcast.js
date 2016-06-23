const triggers = require('../../util/triggers');
const permissions = require('../../util/permissions');
const Command = require('../command');

class Broadcast extends Command {
  message(msg) {
    if (permissions.isBotOwner(msg.author)) {
      if (triggers.messageTriggered(msg, /^broadcast .+$/)) {
        const broadcast = msg.content.split('broadcast ');
        this.log(`Broadcasting '${broadcast[1]}'`);

        this.client.servers.forEach(server => {
          this.client.sendMessage(server.defaultChannel, `[BROADCAST] ${broadcast[1]}`);
        });

        this.client.sendMessage(msg.channel, 'Message broadcasted.');
      }
    }
  }
}

module.exports = new Broadcast();
