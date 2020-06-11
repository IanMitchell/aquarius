import debug from 'debug';

const log = debug('Ping');

export const info = {
  name: 'ping',
  description: 'Checks to see if the bot is online and responding.',
  usage: '```ping```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onTrigger(/^ping$/i, (message) => {
    log("I'm up!");
    message.channel.send('pong');
    analytics.trackUsage('ping', message);
  });
};
