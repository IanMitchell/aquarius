import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Ping');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'ping',
  description: 'Checks to see if the bot is online and responding.',
  usage: '```ping```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onTrigger(/^ping$/i, (message) => {
    log.info("I'm up!", getMessageMeta(message));
    message.channel.send('pong');
    analytics.trackUsage('ping', message);
  });
};
