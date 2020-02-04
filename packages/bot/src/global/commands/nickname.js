import Sentry from '@aquarius/sentry';
import debug from 'debug';
import Discord from 'discord.js';

// CJS / ESM compatibility
const { Permissions } = Discord;

const log = debug('Nickname');

export const info = {
  name: 'nickname',
  description: "Updates the bot's nickname.",
  permissions: [Permissions.FLAGS.CHANGE_NICKNAME],
  usage: '```@Aquarius nickname <name>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^nick(?:name)? (?<nickname>.*)/i,
    async (message, { groups }) => {
      if (message.member.hasPermission(Permissions.FLAGS.MANAGE_NICKNAMES)) {
        const check = aquarius.permissions.check(
          message.guild,
          ...info.permissions
        );

        if (!check.valid) {
          log('Invalid permissions');
          message.channel.send(
            aquarius.permissions.getRequestMessage(check.missing)
          );
          return;
        }

        const member = await message.guild.fetchMember(aquarius.user);

        try {
          log(
            `Updating Nickname to '${groups.nickname}' in ${message.guild.name}`
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
