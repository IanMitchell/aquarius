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

exports.triggered = (message) => message.startsWith('.8ball');
exports.message = () => responses[Math.floor(Math.random() * responses.length)];
exports.helpTriggered = (message) => message.includes('8ball') || message.includes('eightball');
exports.help = () => '`.8ball [your question here]`. Randomly outputs a response.';
