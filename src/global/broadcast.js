const Aquarius = require('../aquarius');

class Broadcast extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Permissions.isBotOwner(msg.author)) {
      if (Aquarius.Triggers.messageTriggered(msg, /^broadcast .+$/)) {
        const broadcast = msg.content.split('broadcast ');
        this.log(`Broadcasting '${broadcast[1]}'`);

        Aquarius.Client.guilds.forEach(guild => {
          guild.defaultChannel.send(`[BROADCAST] ${broadcast[1]}`);
        });

        msg.channel.send('Message broadcasted.');
      }
    }
  }
}

module.exports = new Broadcast();
