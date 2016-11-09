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

  getSize(guild) {
    let val = parseInt(this.getSetting(guild, 'size'), 10);

    if (isNaN(val)) {
      val = MESSAGE_STACK_SIZE;
    }

    val = Math.max(2, val);

    return val;
  }

  pushMessage(msg) {
    const guild = msg.guild.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(guild)) {
      this.log(`Creating entry for ${msg.guild.name}`);
      this.messageStack.set(guild, new Map());

      msg.guild.channels.forEach(chan => {
        this.messageStack.get(guild).set(chan.name, []);
      });
    }

    if (!this.messageStack.get(guild).get(channel)) {
      this.messageStack.get(guild).set(channel, []);
    }

    this.messageStack.get(guild).get(channel).push(msg.content);

    // Only track last couple messages
    if (this.messageStack.get(guild).get(channel).length > this.getSize(guild)) {
      this.messageStack.get(guild).get(channel).shift();
    }
  }

  isSame(msg) {
    const guild = msg.channel.guild.id;
    const channel = msg.channel.name;

    if (!this.messageStack.get(guild).get(channel)) {
      return false;
    }

    if (this.messageStack.get(guild).get(channel).length !== this.getSize(guild)) {
      return false;
    }

    const unique = this.messageStack.get(guild).get(channel).uniq();

    if (unique.length === 1 && unique[0] === msg.content) {
      return true;
    }

    return false;
  }

  message(msg) {
    if (msg.content === '' || msg.guild === undefined || msg.guild === null) {
      return false;
    }

    this.pushMessage(msg);

    if (this.isSame(msg)) {
      this.log(`Sending '${msg.cleanContent}' to ${msg.guild.id}`);
      this.messageStack.get(msg.guild.id).set(msg.channel.name, []);
      msg.channel.sendMessage(msg.content);
    }
  }
}

module.exports = new Same();
