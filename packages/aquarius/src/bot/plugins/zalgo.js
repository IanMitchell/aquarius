import chalk from 'chalk';
import { Permissions } from 'discord.js';
import Zalgo from 'unzalgo';
import getLogger from '../../core/logging/log';

// CJS / ESM compatibility
const { isZalgo } = Zalgo;

const log = getLogger('Zalgo');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'zalgo',
  description: 'Automatically deletes messages containing Zalgo.',
  permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    if (isZalgo(message.cleanContent.replace(':','')) && message.deletable) {
      log.info(
        `Removing message from ${chalk.green(
          message.author.username
        )} in ${chalk.green(message.guild.name)}`
      );
      message.delete();
      message.channel.send(
        `Hey ${message.author}, please don't post Zalgo! I've removed your message`
      );
      analytics.trackUsage('delete', message);
    }
  });
};
