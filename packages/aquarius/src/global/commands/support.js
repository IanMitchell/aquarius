import chalk from 'chalk';
import getLogger from '../../core/logging/log';

const log = getLogger('Support');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'support',
  description: 'Get an invite to the official bot server',
  usage: '```@Aquarius support```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: switch to slash command
  aquarius.onCommand(/^support/i, (message) => {
    log.info(`Support request in ${chalk.green(message.guild.name)}`);

    message.channel.send('http://discord.companyinc.company');
    analytics.trackUsage('support', message);
  });
};
