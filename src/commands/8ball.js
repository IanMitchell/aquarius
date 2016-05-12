const debug = require('debug');
const triggers = require('../util/triggers');

const log = debug('Eightball');

const responses = [
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

const message = msg => {
  if (triggers.messageTriggered(msg, /^8ball .+$/i)) {
    log('8ball request');
    const response = responses[Math.floor(Math.random() * responses.length)];
    return `${msg.author}: ${response}`;
  }

  return false;
};

module.exports = {
  name: '8ball',
  help: '`@bot 8ball [your question here]`. Randomly outputs a response.',
  message,
};
