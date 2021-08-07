import { checkBotPermissions } from '@aquarius-bot/permissions';
import chalk from 'chalk';
import { Permissions } from 'discord.js';
import { randomChance } from '../../core/helpers/math';
import getLogger from '../../core/logging/log';

const log = getLogger('Nice');

export const info = {
  name: 'nice',
  description: 'Comments on nice messages.',
  permissions: [Permissions.FLAGS.ADD_REACTIONS],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    if (
      message.cleanContent.includes('69') ||
      message.cleanContent.match(/(?:(?::six:)|6️⃣) ?(?:(?::nine:)|9️⃣)/)
    ) {
      log.info(`69 in ${chalk.green(message.guild.name)}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (check.valid) {
        message.react('👌');
      }

      if (randomChance(0.1)) {
        message.channel.send('nice');
      }

      analytics.trackUsage('nice', message);
    }
  });
};
