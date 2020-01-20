import debug from 'debug';

const log = debug('Support');

export const info = {
  name: 'support',
  description: 'Get a link to the official bot server',
  usage: '```@Aquarius support```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^support/i, async message => {
    log(`Support request in ${message.guild.name}`);

    message.channel.send('http://discord.companyinc.company');
    analytics.trackUsage('support', message);
  });
};
