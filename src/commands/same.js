const Command = require('../core/command');

const MESSAGE_STACK_SIZE = 4;

class Same extends Command {
  constructor() {
    super();
    this.messageStack = new Map();
    this.settings.addKey('size',
                         MESSAGE_STACK_SIZE,
                         'How many repeated messages before mimicked');
  }

  pushMessage(msg) {
    const server = msg.channel.server.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(server)) {
      this.log(`Creating entry for ${server}`);
      this.messageStack.set(server, new Map());

      msg.channel.server.channels.forEach(chan => {
        this.messageStack.get(server).set(chan.name, []);
      });
    }

    this.messageStack.get(server).get(channel).push(msg.cleanContent);

    // Only track last couple messages
    if (this.messageStack.get(server).get(channel).length > MESSAGE_STACK_SIZE) {
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

    if (this.messageStack.get(server).get(channel).length !== MESSAGE_STACK_SIZE) {
      return false;
    }

    const unique = this.messageStack.get(server).get(channel).filter(this.onlyUnique);

    if (unique.length === 1 && unique[0] === msg.cleanContent) {
      return true;
    }

    return false;
  }

  message(msg) {
    // TODO: Crashes on new server addition

    if (msg.cleanContent === '') {
      return false;
    }

    this.pushMessage(msg);

    if (this.isSame(msg)) {
      this.log(`Sending '${msg.cleanContent}' to ${msg.channel.server.id}`);
      this.messageStack.get(msg.channel.server.id).set(msg.channel.name, []);
      return msg.cleanContent;
    }

    return false;
  }

  helpMessage() {
    return 'Same automatically responds to certain phrases.';
  }
}

module.exports = new Same();
