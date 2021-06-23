import Sentry from '@aquarius-bot/sentry';
import fetch from 'node-fetch';
import getLogger from '../../core/logging/log';

const log = getLogger('GDQ');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'gdq',
  description: 'Gets a random Games Done Quick donation message.',
  usage: '```@Aquarius gdq```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^gdq$/i, async (message) => {
    log.info('Getting message');

    try {
      const response = await fetch('http://taskinoz.com/gdq/api');
      const body = await response.text();
      message.channel.send(body);
    } catch (error) {
      log.error(error);
      Sentry.captureException(error);

      message.channel.send(
        "Sorry, I wasn't able to create a donation message!"
      );
    }

    analytics.trackUsage('gdq', message);
  });
};
