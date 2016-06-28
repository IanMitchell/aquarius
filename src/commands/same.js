const Command = require('../core/command');

const MESSAGE_STACK_SIZE = 4;

class Same extends Command {
  constructor() {
    super();

    this.description = 'After X posts with the same message the bot will mimic it';

    this.messageStack = new Map();
    this.settings.addKey('size',
                         MESSAGE_STACK_SIZE,
                         'How many repeated messages before the bot mimics.');
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
    const size = this.getSetting(server, 'size');

    if (this.messageStack.get(server).get(channel).length > size) {
      this.messageStack.get(server).get(channel).shift();
    }
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  isSame(msg) {
    const server = msg.channel.server.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(server).get(channel)) {
      return false;
    }

    const size = this.getSetting(server, 'size');

    if (this.messageStack.get(server).get(channel).length !== size) {
      return false;
    }

    const unique = this.messageStack.get(server).get(channel).filter(this.onlyUnique);

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
