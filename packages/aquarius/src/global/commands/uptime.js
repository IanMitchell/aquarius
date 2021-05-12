import { getExactTimeInterval } from '../../core/helpers/dates';
import getLogger from '../../core/logging/log';

const log = getLogger('Uptime');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'uptime',
  description: 'Displays how long the bot has been running.',
  usage: '```@Aquarius uptime```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^uptime/i, (message) => {
    log.info('Uptime Requested');
    const uptime = getExactTimeInterval(
      Date.now() - aquarius.uptime,
      Date.now()
    );
    message.channel.send(`I've been up for ${uptime}`);

    analytics.trackUsage('uptime', message);
  });
};
