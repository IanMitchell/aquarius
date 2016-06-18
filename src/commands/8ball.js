const triggers = require('../util/triggers');
const Command = require('../core/command');

class Eightball extends Command {
  constructor() {
    super();

    this.name = '8ball';
    this.description = 'Outputs one of the twenty 8ball responses.';
    this.usage = `\`@${this.client.user.name} 8ball [message]\``;

    this.settings.addKey('name', 'Eightball', 'What to call 8ball on your server');
    // this.settings.addServer('91318657375825920');
    // this.settings.addCommand('91318657375825920', this.name);

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

  message(msg) {
    if (triggers.messageTriggered(msg, /^8ball .+$/i)) {
      this.log('8ball request');
      return this.responses[Math.floor(Math.random() * this.responses.length)];
    }

    return false;
  }
}

module.exports = new Eightball();
