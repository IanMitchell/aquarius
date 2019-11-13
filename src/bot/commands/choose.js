import debug from 'debug';
import { humanize, randomValue } from '../../lib/helpers/lists';

const log = debug('Choose');

export const info = {
  name: 'choose',
  description:
    'Randomly chooses a value from a range or comma/space delimited list.',
  usage: ' ```@Aquarius choose (<lowerBound>-<upperBound>|<options>...)```',
};

const MAX_DECIMAL_PRECISION = 20;
const RANGE_REGEX = /^(?<lowerBound>-?\d+(?<lowerBoundDecimal>\.\d+)?)-(?<upperBound>-?\d+(?<upperBoundDecimal>\.\d+)?)$/i;

function getChoices(input, delimiter) {
  const choices = [];

  input.split(delimiter).forEach(choice => {
    const value = choice.trim();

    if (value) {
      choices.push(value);
    }
  });

  return choices;
}

function countDecimals(number) {
  if (Math.floor(number) === number && !number.toString().includes('.')) {
    return 0;
  }

  return number.toString().split('.')[1].length || 0;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^c(?:hoose)? (?<input>.+)$/i,
    async (message, { groups }) => {
      // Check for a choice in a range
      const rangeMatch = groups.input.match(RANGE_REGEX);

      if (rangeMatch) {
        const { groups: rangeGroups } = rangeMatch;
        log(
          `Matching between ${rangeGroups.lowerBound} and ${rangeGroups.upperBound}`
        );

        const min = Math.min(
          parseFloat(rangeGroups.lowerBound),
          parseFloat(rangeGroups.upperBound)
        );
        const max = Math.max(
          parseFloat(rangeGroups.lowerBound),
          parseFloat(rangeGroups.upperBound)
        );

        if (rangeGroups.lowerBoundDecimal || rangeGroups.upperBoundDecimal) {
          const decimals = Math.min(
            Math.max(
              countDecimals(parseFloat(rangeGroups.lowerBound)),
              countDecimals(parseFloat(rangeGroups.upperBound))
            ),
            MAX_DECIMAL_PRECISION
          );

          message.channel.send(
            (min + Math.random() * (max - min)).toFixed(decimals)
          );
          analytics.trackUsage('choose', message);
          return;
        }

        message.channel.send(Math.floor(min + Math.random() * (max - min + 1)));
        analytics.trackUsage('choose', message);
        return;
      }

      // Get a choice in a list delimited by a space or comma
      let choices = getChoices(groups.input, ',');
      if (choices.length <= 1) {
        choices = getChoices(groups.input, ' ');
      }

      if (choices.length === 0) {
        message.channel.send('There are no choices to choose from!');
        return;
      }

      log(`Matching between ${humanize(choices)}`);
      message.channel.send(randomValue(choices));
      analytics.trackUsage('choose', message);
    }
  );
};
