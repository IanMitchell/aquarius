import debug from 'debug';
import { getExactTimeInterval } from '../../lib/helpers/dates.js';

const log = debug('Uptime');

export const info = {
  name: 'uptime',
  description: 'Displays how long the bot has been running.',
  usage: '```@Aquarius uptime```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^uptime/i, async message => {
    log('Uptime Requested');
    const uptime = getExactTimeInterval(
      Date.now() - aquarius.uptime,
      Date.now()
    );
    message.channel.send(`I've been up for ${uptime}`);

    analytics.trackUsage('uptime', message);
  });
};
