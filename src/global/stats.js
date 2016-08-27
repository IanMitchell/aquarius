const Aquarius = require('../aquarius');
const moment = require('moment');

class Stats extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^uptime$/i)) {
      this.log(`Uptime called: ${this.client.uptime}ms`);
      const uptime = moment(Date.now() - this.client.uptime).fromNow(true);
      return `Aquarius has been up for ${uptime}`;
    }

    if (Aquarius.Permissions.isBotOwner(msg.author) && Aquarius.Triggers.messageTriggered(msg, /^servers$/i)) {
      const count = this.client.servers.length;
      this.log(`Server count: ${count}`);

      let str = `**${this.client.user.name} is in ${count} Servers**\n`;

      this.client.servers.forEach((server, i) => {
        str += `${i + 1}. ${server.name} -- *(${server.members.length} members)*\n`;
      });

      return str;
    }

    return false;
  }
}

module.exports = new Stats();
