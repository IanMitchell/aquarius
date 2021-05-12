import debug from 'debug';
import { getInputAsNumber } from '../../core/helpers/input';
import { humanize, shuffle } from '../../core/helpers/lists';

const log = debug('Order');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'order',
  description:
    'Randomizes a range or list of values separated by spaces or commas.',
  usage: '```@Aquarius order (<lowerBound>-<upperBound>|<options>...)```',
};

const RANGE_REGEX = /(?<lowerBound>-?\d+)-(?<upperBound>-?\d+)$/i;
const ORDER_LIMITS = {
  VALUE: 99999999999,
  RANGE: 1024,
  RESULTS: 20,
};

function getRange(lowerBound, upperBound) {
  let results = [];
  let correctedUpperBound = upperBound;

  if (upperBound - lowerBound > ORDER_LIMITS.RANGE) {
    correctedUpperBound = lowerBound + ORDER_LIMITS.RANGE;
  }

  results = Array.from(
    new Array(correctedUpperBound - lowerBound + 1),
    (value, key) => key + lowerBound
  );

  results = shuffle(results);

  // Add notice at the end of the shuffled array
  if (results.length > ORDER_LIMITS.RESULTS) {
    results = results.splice(0, ORDER_LIMITS.RESULTS);
    results.push('and some more...');
  }

  return results;
}

function getChoices(input, delimiter) {
  const choices = [];

  input.split(delimiter).forEach((choice) => {
    const value = choice.trim();

    if (value) {
      choices.push(value);
    }
  });

  return choices;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^o(?:rder)? (?<input>.+)$/i, (message, { groups }) => {
    // Check for a range
    const rangeMatch = groups.input.match(RANGE_REGEX);

    if (rangeMatch) {
      const { groups: rangeGroups } = rangeMatch;
      log(
        `Matching between ${rangeGroups.lowerBound} and ${rangeGroups.upperBound}`
      );

      const min = Math.min(
        getInputAsNumber(rangeGroups.lowerBound),
        getInputAsNumber(rangeGroups.upperBound)
      );
      const max = Math.max(
        getInputAsNumber(rangeGroups.lowerBound),
        getInputAsNumber(rangeGroups.upperBound)
      );

      if (min >= ORDER_LIMITS.VALUE || max >= ORDER_LIMITS.VALUE) {
        message.channel.send('Value is too high!');
        return;
      }

      log(`Randomizing between ${min} and ${max}`);
      const choices = getRange(min, max);
      message.channel.send(choices.join(', '));
      analytics.trackUsage('order', message);
      return;
    }

    // Get a list delimited by a space or comma
    let choices = getChoices(groups.input, ',');
    if (choices.length <= 1) {
      choices = getChoices(groups.input, ' ');
    }

    if (choices.length === 0) {
      message.channel.send('There are no choices to randomize!');
      return;
    }

    log(`Randomizing ${humanize(choices)}`);
    message.channel.send(shuffle(choices).join(', '));
    analytics.trackUsage('order', message);
  });
};
