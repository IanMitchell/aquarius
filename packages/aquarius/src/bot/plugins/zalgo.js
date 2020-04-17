import debug from 'debug';
import { Permissions } from 'discord.js';
import Zalgo from 'unzalgo';

// CJS / ESM compatibility
const { isZalgo } = Zalgo;

const log = debug('Zalgo');

export const info = {
  name: 'zalgo',
  description: 'Automatically deletes messages containing Zalgo.',
  permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    if (isZalgo(message.cleanContent) && message.deletable) {
      log(
        `Removing message from ${message.author.username} in ${message.guild.name}`
      );
      message.delete();
      message.channel.send(
        `Hey ${message.author}, please don't post Zalgo! I've removed your message`
      );
      analytics.trackUsage('delete', message);
    }
  });
};
