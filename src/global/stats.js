const Aquarius = require('../aquarius');
const moment = require('moment');

class Stats extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^uptime$/i)) {
      this.log(`Uptime called: ${Aquarius.Client.uptime}ms`);
      const uptime = moment(Date.now() - Aquarius.Client.uptime).fromNow(true);
      msg.channel.send(`Aquarius has been up for ${uptime}`);
    }

    if (Aquarius.Permissions.isBotOwner(msg.author) && Aquarius.Triggers.messageTriggered(msg, /^servers$/i)) {
      const count = Aquarius.Client.guilds.array().length;
      this.log(`Server count: ${count}`);

      let str = `**${Aquarius.Client.user.username} is in ${count} Servers**\n`;

      Aquarius.Client.guilds.array().forEach((guild, i) => {
        str += `${i + 1}. ${guild.name} -- *(${guild.memberCount} members)*\n`;
      });

      msg.channel.send(str);
    }
  }
}

module.exports = new Stats();
