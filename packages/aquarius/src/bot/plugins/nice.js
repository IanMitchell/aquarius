import { checkBotPermissions } from '@aquarius-bot/permissions';
import debug from 'debug';
import { Permissions } from 'discord.js';

const log = debug('Nice');

export const info = {
  name: 'nice',
  description: 'Comments on nice messages.',
  permissions: [Permissions.FLAGS.ADD_REACTIONS],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    if (message.cleanContent.match(/\b69\b/)) {
      log(`69 in ${message.guild.name}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (check.valid) {
        message.react('👌');
      }

      message.channel.send('nice');
      analytics.trackUsage('nice', message);
    }
  });
};
