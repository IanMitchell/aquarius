import fetch from 'node-fetch';
import debug from 'debug';
import Sentry from '../../lib/errors/sentry.js';

const log = debug('DadJoke');

export const info = {
  name: 'dadjoke',
  description: 'Sends a random dad joke.',
  usage: '```@Aquarius dadjoke```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^dadjoke$/i, async message => {
    log('Sending dadjoke');
    aquarius.loading.start(message.channel);

    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'text/plain',
          'User-Agent':
            'Aquarius-V2 (https://github.com/IanMitchell/aquarius-v2)',
        },
      });

      const body = await response.text();
      message.channel.send(body);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send("Sorry, I wasn't able to get a dad joke!");
    }

    aquarius.loading.stop(message.channel);
    analytics.trackUsage('dadjoke', message);
  });
};
