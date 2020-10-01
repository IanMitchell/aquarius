import debug from 'debug';

const log = debug('Support');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'support',
  description: 'Get an invite to the official bot server',
  usage: '```@Aquarius support```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^support/i, (message) => {
    log(`Support request in ${message.guild.name}`);

    message.channel.send('http://discord.companyinc.company');
    analytics.trackUsage('support', message);
  });
};
