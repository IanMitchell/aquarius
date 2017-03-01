const Aquarius = require('../aquarius');

class Hashtag extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Adds hashtags using emoji responses.';
  }

  message(msg) {
    if (msg.cleanContent.toLowerCase().includes('hashtag')) {
      this.log('Adding Hashtag Reaction');

      msg.react('✋')
        .then(() => msg.react('#⃣'))
        .then(() => msg.react('🇭'))
        .then(() => msg.react('🇹'))
        .then(() => msg.react('🇦'))
        .then(() => msg.react('🇬'))
        .then(() => msg.react('🇸'))
        .catch(this.log);
    }
  }
}

module.exports = new Hashtag();
