import Sentry from '@aquarius-bot/sentry';
import fetch from 'node-fetch';
import getLogger from '../../core/logging/log';

const log = getLogger('DadJoke');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'dadjoke',
  description: 'Sends a random dad joke.',
  usage: '```@Aquarius dadjoke```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^dadjoke$/i, async (message) => {
    log.info('Sending dadjoke');

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
      log.error(error);
      Sentry.captureException(error);

      message.channel.send("Sorry, I wasn't able to get a dad joke!");
    }

    analytics.trackUsage('dadjoke', message);
  });
};
