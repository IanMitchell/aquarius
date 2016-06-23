const pkg = require('../../../package');
const triggers = require('../../util/triggers');
const Command = require('../command');
const links = require('../../util/links');

class Info extends Command {
  constructor() {
    super();

    let str = `Aquarius v${pkg.version}. `;
    str += `\`@${this.client.user.name} help\` for help. ${links.repoLink()}`;

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
