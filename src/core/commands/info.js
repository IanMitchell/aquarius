const pkg = require('../../../package');
const triggers = require('../../util/triggers');
const users = require('../../util/users');
const Command = require('../command');
const links = require('../../util/links');

class Info extends Command {
  message(msg) {
    if (triggers.messageTriggered(msg, /^info$/)) {
      this.log('Info Request');

      const nickname = users.getNickname(msg.server, this.client.user);
      let str = `Aquarius v${pkg.version}. `;
      str += `\`@${nickname} help\` for help. ${links.repoLink()}`;
      str += `\n\nAdd ${this.client.user} here ${links.botLink()}`;

      this.client.sendMessage(msg.channel, str);
    }
  }
}

module.exports = new Info();
