const Aquarius = require('../aquarius');

class Hashtag extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Adds hashtags using emoji responses.';
  }

  message(msg) {
    if (msg.cleanContent.includes('hashtag')) {
      this.log('Adding Hashtag Reaction');

      msg.addReaction('✋')
        // .then(() => msg.addReaction('#'))
        .then(() => msg.toLowerCase().addReaction(encodeURI('🇭')))
        .then(() => msg.toLowerCase().addReaction(encodeURI('🇹')))
        .then(() => msg.toLowerCase().addReaction(encodeURI('🇦')))
        .then(() => msg.toLowerCase().addReaction(encodeURI('🇬')))
        .then(() => msg.toLowerCase().addReaction(encodeURI('🇸')))
        .catch(this.log);
    }
  }
}

module.exports = new Hashtag();
