const Aquarius = require('../aquarius');
const pkg = require('../../package');

class Info extends Aquarius.Command {
  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^info$/)) {
      this.log('Info Request');

      const nickname = Aquarius.Users.getNickname(msg.server, this.client.user);
      let str = `Aquarius v${pkg.version}. `;
      str += `\`@${nickname} help\` for help. ${Aquarius.Links.repoLink()}`;
      str += `\n\nAdd ${this.client.user} here ${Aquarius.Links.botLink()}`;

      this.client.sendMessage(msg.channel, str);
    }
  }
}

module.exports = new Info();
