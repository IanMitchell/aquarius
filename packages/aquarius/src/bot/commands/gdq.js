import { startLoading, stopLoading } from '@aquarius/loading';
import Sentry from '@aquarius/sentry';
import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('GDQ');

export const info = {
  name: 'gdq',
  description: 'Gets a random Games Done Quick donation message.',
  usage: '```@Aquarius gdq```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^gdq$/i, async (message) => {
    log('Getting message');
    startLoading(message.channel);

    try {
      const response = await fetch('http://taskinoz.com/gdq/api');
      const body = await response.text();
      message.channel.send(body);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send(
        "Sorry, I wasn't able to create a donation message!"
      );
    }

    stopLoading(message.channel);
    analytics.trackUsage('gdq', message);
  });
};
