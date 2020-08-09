import debug from 'debug';

const log = debug('Donate');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'donate',
  description: 'Displays donation information',
  usage: '```@Aquarius donate```',
};

// TODO: Write up donation message
/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^donate/i, (message) => {
    log(`Donate request in ${message.guild.name}`);

    message.channel.send(
      "If you'd like to contribute to server and hosting costs you can donate by sending money to $IanMitchel1 via the Cash App"
    );
    analytics.trackUsage('donate', message);
  });
};
