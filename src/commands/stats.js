const moment = require('moment');
const triggers = require('../util/triggers');
const permissions = require('../util/permissions');
const Command = require('../core/command');

class Stats extends Command {
  message(msg) {
    if (triggers.messageTriggered(msg, /^uptime$/i)) {
      this.log(`Uptime called: ${msg.client.uptime}ms`);
      const uptime = moment(Date.now() - msg.client.uptime).fromNow(true);
      return `Aquarius has been up for ${uptime}`;
    }

    if (permissions.isBotOwner(msg.author) && triggers.messageTriggered(msg, /^servers$/i)) {
      const count = msg.client.servers.length;
      this.log(`Server count: ${count}`);

      let str = `**${msg.client.user.name} is in ${count} Servers**\n`;

      msg.client.servers.forEach((server, i) => {
        str += `${i + 1}. ${server.name} -- *(${server.members.length} members)*\n`;
      });

      return str;
    }

    return false;
  }

  helpMessage() {
    return 'Stats displays certain stats about the bot.';
  }
}

module.exports = new Stats();
