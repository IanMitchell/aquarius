import chalk from 'chalk';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Donate');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'donate',
  description: 'Displays donation information',
  usage: '```@Aquarius donate```',
};

// TODO: Write up donation message
/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^donate/i, (message) => {
    log.info(
      `Donate request in ${chalk.green(message.guild.name)}`,
      getMessageMeta(message)
    );

    message.channel.send(
      "If you'd like to contribute to server and hosting costs you can donate by sending money to $IanMitchel1 via the Cash App"
    );
    analytics.trackUsage('donate', message);
  });
};
