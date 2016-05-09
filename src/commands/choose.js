const debug = require('debug');
const log = debug('Choose');


const getChoices = (input, delimiter) => {
  const choices = [];

  input.split(delimiter).forEach(choice => {
    const val = choice.trim();
    if (val) {
      choices.push(val);
    }
  });

  return choices;
};

const countDecimals = number => {
  if (Math.floor(number) === number && !number.toString().includes('.')) {
    return 0;
  }

  return number.toString().split('.')[1].length || 0;
};

const choose = input => {
  const rangeRegex = /^(-?\d+(\.\d+)?)-(-?\d+(\.\d+)?)$/i;
  const range = input.match(rangeRegex);

  // Choose from a range (.c 1-100)
  if (range) {
    const min = Math.min(parseFloat(range[1]), parseFloat(range[3]));
    const max = Math.max(parseFloat(range[1]), parseFloat(range[3]));

    // Range of Floats
    if (range[2] || range[4]) {
      const decimals = Math.min(Math.max(
                      countDecimals(range[1]),
                      countDecimals(range[3])
                    ), 19);

      return (min + Math.random() * (max - min)).toFixed(decimals);
    }

    // Range of Integers - Add +1 so that the upperbound is included
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  // Choose from list delimited by ',' or ' '
  let choices = getChoices(input, ',');

  if (choices) {
    // Check for space delimiter
    if (choices.length <= 1) {
      choices = getChoices(input, ' ');

      if (choices.length === 0) {
        return 'No choices to choose from';
      }
    }

    return choices[Math.floor(Math.random() * choices.length)];
  }

  return 'No choices to choose from';
};


const message = msg => {
  const botMention = msg.client.user.mention().toLowerCase();

  if (msg.content.startsWith(`${botMention} choose `)) {
    const triggerRegex = /^@[#\w]+ choose (.+)/i;

    const inputs = msg.cleanContent.match(triggerRegex);
    if (inputs) {
      log(`input: ${inputs[1]}`);
      return choose(inputs[1]);
    }
  }

  return false;
};

module.exports = {
  name: 'choose',
  help: '`@bot choose 1, 2, 3, 3`. Randomly chooses from a comma or space separated list',
  message,
};
