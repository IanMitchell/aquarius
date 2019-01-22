import fetch from 'node-fetch';
import debug from 'debug';

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
    aquarius.loading.start(message.channel);

    try {
      const response = await fetch('http://taskinoz.com/gdq/api');
      const body = await response.text();
      message.channel.send(body);
    } catch (error) {
      log(error);
      message.channel.send("Sorry, I wasn't able to create a donation message!");
    }

    aquarius.loading.stop(message.channel);
    analytics.trackUsage('gdq', message);
  });
};
