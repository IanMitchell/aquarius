import { checkBotPermissions } from '@aquarius-bot/permissions';
import chalk from 'chalk';
import { Permissions } from 'discord.js';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Hashtag');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'hashtag',
  description: 'Discourages hashtags through emoji responses.',
  permissions: [Permissions.FLAGS.ADD_REACTIONS],
};

async function decorateMessage(message) {
  await message.react('✋');
  await message.react('#⃣');
  await message.react('🇭');
  await message.react('🇹');
  await message.react('🇦');
  await message.react('🇬');
  await message.react('🇸');
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    const matches = message.cleanContent.match(/(?<channel>#\w+)/i);

    if (matches) {
      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.warn('Invalid permissions', getMessageMeta(message));
        return;
      }

      const channels = message?.mentions?.channels?.size ?? 0;

      if (matches.length - 1 > channels) {
        log.info(
          `Decorating ${chalk.blue(matches.groups.channel)} by ${chalk.green(
            message.author.username
          )}`
        );
        decorateMessage(message);
        analytics.trackUsage('decorate', message, { type: 'hash' });
      }
    } else if (message.cleanContent.toLowerCase().includes('hashtag')) {
      log.info(
        `Decorating Hashtag word by ${chalk.green(message.author.username)}`
      );
      decorateMessage(message);
      analytics.trackUsage('decorate', message, { type: 'word' });
    }
  });
};
