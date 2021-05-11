import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('DadJoke');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'dadjoke',
  description: 'Sends a random dad joke.',
  usage: '```@Aquarius dadjoke```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^dadjoke$/i, async (message) => {
    log('Sending dadjoke');

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

    analytics.trackUsage('dadjoke', message);
  });
};
