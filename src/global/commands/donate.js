import debug from 'debug';

const log = debug('Donate');

// TODO: Enable
export const info = {
  name: 'donate',
  description: 'Displays donation information',
  usage: '```@Aquarius donate```',
  disabled: true,
};

// TODO: Write up donation message
/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^donate/i, async message => {
    log(`Donate request in ${message.guild.name}`);

    message.channel.send('You can donate by sending money to $IanMitchel1');
    analytics.trackUsage('donate', message);
  });
};
