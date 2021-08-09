import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import { Permissions } from 'discord.js';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Nickname');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'nickname',
  description: "Updates the bot's nickname.",
  permissions: [Permissions.FLAGS.CHANGE_NICKNAME],
  usage: '```@Aquarius nickname <name>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(
    /^nick(?:name)? (?<nickname>.*)/i,
    async (message, { groups }) => {
      if (
        aquarius.permissions.isBotAdmin(message.author) ||
        message.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)
      ) {
        const check = checkBotPermissions(message.guild, ...info.permissions);

        if (!check.valid) {
          log.warn('Invalid permissions', getMessageMeta(message));
          message.channel.send(
            aquarius.permissions.getRequestMessage(check.missing)
          );
          return;
        }

        const member = await message.guild.members.fetch(aquarius.user);

        try {
          log.info(
            `Updating Nickname to '${chalk.blue(
              groups.nickname
            )}' in ${chalk.green(message.guild.name)}`
          );
          await member.setNickname(groups.nickname);
          message.channel.send('Nickname changed!');
          analytics.trackUsage('nickname', message);
        } catch (error) {
          Sentry.captureException(error);
          message.channel.send(
            "I couldn't update my nickname - please make sure it's valid!"
          );
        }
      } else {
        message.channel.send(
          "You don't have permission to change my nickname!"
        );
      }
    }
  );
};
