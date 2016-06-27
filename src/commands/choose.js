const triggers = require('../util/triggers');
const Command = require('../core/command');

class Choose extends Command {
  constructor() {
    super();

    this.description = 'Given a list of space/comma delimited values randomly chooses a value.';
    this.description += '\nGiven a range of numbers randomly chooses a value.';

    this.usage = `\`\`\`@${this.client.user.name} choose [message]\`\`\``;
  }

  message(msg) {
    const inputs = triggers.messageTriggered(msg, /^c(?:hoose)? (.+)$/i);

    if (inputs) {
      this.log(`input: ${inputs[1]}`);
      return this.choose(inputs[1]);
    }

    return false;
  }

  choose(input) {
    const rangeRegex = /^(-?\d+(\.\d+)?)-(-?\d+(\.\d+)?)$/i;
    const range = input.match(rangeRegex);

    // Choose from a range (.c 1-100)
    if (range) {
      const min = Math.min(parseFloat(range[1]), parseFloat(range[3]));
      const max = Math.max(parseFloat(range[1]), parseFloat(range[3]));

      // Range of Floats
      if (range[2] || range[4]) {
        const decimals = Math.min(Math.max(
                        this.countDecimals(parseFloat(range[1])),
                        this.countDecimals(parseFloat(range[3]))
                      ), 19);

        return (min + Math.random() * (max - min)).toFixed(decimals);
      }

      // Range of Integers - Add +1 so that the upperbound is included
      return Math.floor(min + Math.random() * (max - min + 1));
    }

    // Choose from list delimited by ',' or ' '
    let choices = this.getChoices(input, ',');

    if (choices) {
      // Check for space delimiter
      if (choices.length <= 1) {
        choices = this.getChoices(input, ' ');

        if (choices.length === 0) {
          return 'No choices to choose from';
        }
      }

      return choices[Math.floor(Math.random() * choices.length)];
    }

    return 'No choices to choose from';
  }

  getChoices(input, delimiter) {
    const choices = [];

    input.split(delimiter).forEach(choice => {
      const val = choice.trim();

      // TODO: Allow 0 as a value
      if (val) {
        choices.push(val);
      }
    });

    return choices;
  }

  countDecimals(number) {
    if (Math.floor(number) === number && !number.toString().includes('.')) {
      return 0;
    }

    return number.toString().split('.')[1].length || 0;
  }
}

module.exports = new Choose();
