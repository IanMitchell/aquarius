const pkg = require('../../../package');
const triggers = require('../../util/triggers');
const Command = require('../command');

class Info extends Command {
  constructor() {
    super();

    let str = `Aquarius v${pkg.version}. `;
    str += `\`@${this.client.user.name} help\` for help.`;
    str += `http://github.com/${pkg.repository}`;

    this.info = str;
  }

  message(msg) {
    if (triggers.messageTriggered(msg, /^info$/)) {
      this.log('Info Request');
      this.client.sendMessage(msg.channel, this.info);
    }
  }
}

module.exports = new Info();
