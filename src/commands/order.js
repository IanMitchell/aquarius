const Aquarius = require('../aquarius');

const ORDER_MAX_VALUE = 99999999999;
const ORDER_RANGE_LIMIT = 1024;
const ORDER_RESULTS_LIMIT = 20;

class Order extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'Given a list of values randomizes them';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} order [message]\`\`\``;
    msg += '\nExample:\n';
    msg += '```';
    msg += `@${nickname} order 1-6\n`;
    msg += '=> 1, 4, 5, 2, 3\n';
    msg += `@${nickname} order a b c d e\n`;
    msg += '=> a, e, c, b, d\n';
    msg += `@${nickname} order To be, not to be, ¯\\_(ツ)_/¯\n`;
    msg += '=> ¯\\_(ツ)_/¯, not to be, To be\n';
    msg += '```';

    return msg;
  }

  message(msg) {
    const inputs = Aquarius.Triggers.messageTriggered(msg, /^o(?:rder)? (.+)$/i);

    if (inputs) {
      const rangeRegex = /(-?\d+)-(-?\d+)$/i;
      const range = msg.cleanContent.match(rangeRegex);

      if (range) {
        this.log(`Range input: ${range}`);
        return this.orderRange(range);
      }

      this.log(`Order input: ${inputs[1]}`);
      msg.channel.send(this.orderList(inputs[1]));
    }
  }

  getChoices(input, delimiter) {
    const choices = [];

    input.split(delimiter).forEach(choice => {
      const val = choice.trim();
      if (val) {
        choices.push(val);
      }
    });

    return choices;
  }

  orderList(text) {
    let choices = this.getChoices(text, ',');

    if (choices) {
      if (choices.length <= 1) {
        choices = this.getChoices(text, ' ');
      }

      choices = this.shuffleArray(choices);
      return choices.join(', ');
    }

    return 'No choices to choose from';
  }

  getRange(lowerBound, upperBound) {
    let results = [];
    let capped = false;
    let correctedUpperBound = upperBound;

    if (upperBound - lowerBound > ORDER_RANGE_LIMIT) {
      correctedUpperBound = lowerBound + ORDER_RANGE_LIMIT;
    }

    for (let i = lowerBound; i <= correctedUpperBound; i++) {
      if (i - lowerBound > ORDER_RESULTS_LIMIT) {
        capped = true;
      }

      results.push(i.toString());
    }

    results = this.shuffleArray(results);

    if (capped) {
      results = results.splice(0, ORDER_RESULTS_LIMIT);
      results.push('and some more...');
    }

    return results;
  }

  orderRange(order) {
    const min = Math.min(parseInt(order[1], 10), parseInt(order[2], 10));
    const max = Math.max(parseInt(order[1], 10), parseInt(order[2], 10));

    if (min >= ORDER_MAX_VALUE || max >= ORDER_MAX_VALUE) {
      return 'Value is too high.';
    }

    const choices = this.getRange(min, max);
    return choices.join(', ');
  }

  shuffleArray(arr) {
    const array = arr;
    let temp = 0;

    for (let i = array.length - 1; i >= 0; i--) {
      const idx = Math.floor(Math.random() * (array.length - i)) + i;
      temp = array[i];
      array[i] = array[idx];
      array[idx] = temp;
    }

    return array;
  }
}

module.exports = new Order();
