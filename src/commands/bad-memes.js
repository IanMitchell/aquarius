const Aquarius = require('../aquarius');

class BadMemes extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Mocks bad Memes.';
    this.targets = [
      '92790387013324800',
      '91655274259025920',
    ];
  }

  message(msg) {
    if (this.targets.includes(msg.author.id)) {
      if (msg.content.startsWith('🚨') && msg.content.includes('in 5 minutes')) {
        this.log(`Bad 'in 5 minutes' meme from ${msg.author.username}`);
        Aquarius.Users.getNickname(msg.guild, msg.author.id).then(nick => {
          msg.channel.sendMessage(`🚨 muting ${nick} in 5 minutes!`);
        });
      }

      if (msg.content.includes('REEE')) {
        this.log(`Bad 'REEE' meme from ${msg.author.username}`);
        msg.channel.sendMessage("📎 Hi there! It looks like you're trying to send a message but have accidentally enabled caps lock and sticky keys. Would you like help turning those off?");
      }

      if (msg.content.includes(')))')) {
        this.log(`Bad ')))' meme from ${msg.author.username}`);
        msg.channel.sendMessage("SyntaxError: Unclosed ')' detected following gibberish message. Try downloading a tool that supports Syntax Highlighting, such as http://atom.io to avoid future mistakes.");
      }
    }
  }
}

module.exports = new BadMemes();
