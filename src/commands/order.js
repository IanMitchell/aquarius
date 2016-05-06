const debug = require('debug');
const log = debug('Order');

const ORDER_MAX_VALUE = 99999999999;
const ORDER_RANGE_LIMIT = 1024;
const ORDER_RESULTS_LIMIT = 20;


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

const shuffleArray = array => {
  let temp = 0;

  for (let i = array.length - 1; i >= 0; i--) {
    const idx = Math.floor(Math.random() * (array.length - i)) + i;
    temp = array[i];
    array[i] = array[idx];
    array[idx] = temp;
  }

  return array;
};

const orderList = text => {
  let choices = getChoices(text, ',');

  if (choices) {
    if (choices.length <= 1) {
      choices = getChoices(text, ' ');
    }

    choices = shuffleArray(choices);
    return choices.join(', ');
  }

  return 'No choices to choose from';
};

const getRange = (lowerBound, upperBound) => {
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

  results = shuffleArray(results);

  if (capped) {
    results = results.splice(0, ORDER_RESULTS_LIMIT);
    results.push('and some more...');
  }

  return results;
};

const orderRange = order => {
  const min = Math.min(parseInt(order[1], 10), parseInt(order[2], 10));
  const max = Math.max(parseInt(order[1], 10), parseInt(order[2], 10));

  if (min >= ORDER_MAX_VALUE || max >= ORDER_MAX_VALUE) {
    return 'Value is too high.';
  }

  const choices = getRange(min, max);
  return choices.join(', ');
};


const orderRegex = /^[.!]o(?:rder)? (.+)$/i;
const rangeRegex = /(-?\d+)-(-?\d+)$/i;

const triggered = msg => msg.cleanContent.match(orderRegex);
const message = msg => {
  const order = msg.cleanContent.match(orderRegex);
  const range = msg.cleanContent.match(rangeRegex);

  if (range) {
    log(`Range input: ${range}`);
    return orderRange(range);
  }

  log(`Order input: ${order[1]}`);
  return orderList(order[1]);
};

module.exports = {
  name: 'order',
  help: 'TODO',
  triggered,
  message,
};
