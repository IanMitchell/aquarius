const Aquarius = require('../aquarius');

const MESSAGE_STACK_SIZE = 4;

class Same extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'After X posts with the same message the bot will mimic it';

    this.messageStack = new Map();
    this.settings.addKey('size',
                         MESSAGE_STACK_SIZE,
                         'How many repeated messages before the bot mimics (Min: 2)');
  }

  getSize(server) {
    let val = parseInt(this.getSetting(server, 'size'), 10);

    if (isNaN(val)) {
      val = MESSAGE_STACK_SIZE;
    }

    val = Math.max(2, val);

    return val;
  }

  pushMessage(msg) {
    const server = msg.server.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(server)) {
      this.log(`Creating entry for ${server}`);
      this.messageStack.set(server, new Map());

      msg.server.channels.forEach(chan => {
        this.messageStack.get(server).set(chan.name, []);
      });
    }

    if (!this.messageStack.get(server).get(channel)) {
      this.messageStack.get(server).set(channel, []);
    }

    this.messageStack.get(server).get(channel).push(msg.content);

    // Only track last couple messages
    if (this.messageStack.get(server).get(channel).length > this.getSize(server)) {
      this.messageStack.get(server).get(channel).shift();
    }
  }

  isSame(msg) {
    const server = msg.channel.server.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(server).get(channel)) {
      return false;
    }

    if (this.messageStack.get(server).get(channel).length !== this.getSize(server)) {
      return false;
    }

    const unique = this.messageStack.get(server).get(channel).uniq();

    if (unique.length === 1 && unique[0] === msg.content) {
      return true;
    }

    return false;
  }

  message(msg) {
    if (msg.content === '' || msg.server === undefined || msg.server === null) {
      return false;
    }

    this.pushMessage(msg);

    if (this.isSame(msg)) {
      this.log(`Sending '${msg.cleanContent}' to ${msg.server.id}`);
      this.messageStack.get(msg.server.id).set(msg.channel.name, []);
      return msg.content;
    }

    return false;
  }
}

module.exports = new Same();
