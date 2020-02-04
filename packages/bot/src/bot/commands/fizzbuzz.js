import Sentry from '@aquarius/sentry';
import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('Fizzbuzz');

export const info = {
  name: 'fizzbuzz',
  description: 'A fresh take on a classic programming problem.',
  usage: '```@Aquarius fizzbuzz <number>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^fizzbuzz (?<input>[\d]+)$/i,
    async (message, { groups }) => {
      log(`Checking ${groups.input}`);
      aquarius.loading.start(message.channel);

      try {
        const response = await fetch(
          `https://fozzbizz.herokuapp.com/fizzbuzz?num=${groups.input}`
        );
        const json = await response.json();

        if (!json.is_fizz && !json.is_buzz) {
          message.channel.send(groups.input);
        } else {
          let str = '';
          str += json.is_fizz ? 'Fizz' : '';
          str += json.is_buzz ? 'Buzz' : '';

          message.channel.send(str);
        }
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        message.channel.send(
          'Unable to fizzbuzz. Ping @IanMitchel1 on twitter with your complaints'
        );
      }

      aquarius.loading.stop(message.channel);
      analytics.trackUsage('fizzbuzz', message);
    }
  );
};
