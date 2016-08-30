const Aquarius = require('../aquarius');

class Broadcast extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Permissions.isBotOwner(msg.author)) {
      if (Aquarius.Triggers.messageTriggered(msg, /^broadcast .+$/)) {
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
