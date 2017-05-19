const Aquarius = require('../aquarius');

class Eightball extends Aquarius.Command {
  constructor() {
    super();

    this.name = '8ball';
    this.description = 'Outputs one of the twenty 8ball responses.';

    this.responses = [
      'It is certain',
      'It is decidedly so',
      'Without a doubt',
      'Yes, definitely',
      'You may rely on it',
      'As I see it, yes',
      'Most likely',
      'Outlook good',
      'Yes',
      'Signs point to yes',
      'Reply hazy try again',
      'Ask again later',
      'Better not tell you now',
      'Cannot predict now',
      'Concentrate and ask again',
      "Don't count on it",
      'My reply is no',
      'My sources say no',
      'Outlook not so good',
      'Very doubtful',
    ];
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} 8ball [message]\`\`\``;
    return msg;
  }

  message(msg) {
    if (Aquarius.Triggers.messageTriggered(msg, /^8ball .+$/i)) {
      this.log('8ball request');
      msg.channel.send(this.responses[Math.floor(Math.random() * this.responses.length)]);
    }
  }
}

module.exports = new Eightball();
