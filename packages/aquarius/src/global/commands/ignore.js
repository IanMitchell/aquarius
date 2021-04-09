import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION } from '@aquarius-bot/regex';
import { getNickname } from '@aquarius-bot/users';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { humanize } from '../../core/helpers/lists';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Ignore');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'ignore',
  description: 'Tell Aquarius to ignore a user [Admin Only].',
  usage: dedent`
    **View Ignore List**
    \`\`\`@Aquarius ignore list\`\`\`

    **Add User to Ignore List**
    \`\`\`@Aquarius ignore add <@User>\`\`\`

    **Remove User from Ignore List**
    \`\`\`@Aquarius ignore remove <@User>\`\`\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    new RegExp(`^ignore add ${MENTION.source}`, 'i'),
    async (message) => {
      if (aquarius.permissions.isAdmin(message.guild, message.author)) {
        if (message.mentions.users.size > 0) {
          const mentions = await getOrderedMentions(message);
          const user = mentions[mentions.length - 1];
          log.info(
            `Adding ${chalk.green(user.username)} to ${chalk.green(
              message.guild.name
            )}'s ignore list`,
            getMessageMeta(message)
          );

          aquarius.guildManager.get(message.guild.id).ignoreUser(user.id);
          message.channel.send(`Added ${user} to my ignore list`);

          analytics.trackUsage('add', message, { targetUser: user.id });
        } else {
          message.channel.send('Please tag the user you want me to ignore');
        }
      }
    }
  );

  aquarius.onCommand(
    new RegExp(`^ignore remove ${MENTION.source}`, 'i'),
    async (message) => {
      if (aquarius.permissions.isAdmin(message.guild, message.author)) {
        if (message.mentions.users.size > 0) {
          const mentions = await getOrderedMentions(message);
          const user = mentions[mentions.length - 1];
          log.info(
            `Removing ${chalk.green(user.name)} from ${chalk.green(
              message.guild.name
            )}'s ignore list`,
            getMessageMeta(message)
          );

          aquarius.guildManager.get(message.guild.id).unignoreUser(user.id);
          message.channel.send(`Removed ${user} from my ignore list`);

          analytics.trackUsage('remove', message, { targetUser: user.id });
        } else {
          message.channel.send(
            'Please tag the user you want to remove from my ignore list'
          );
        }
      }
    }
  );

  aquarius.onCommand(/^ignore list$/i, (message) => {
    log.info(
      `Generating list for ${chalk.green(message.guild.name)}`,
      getMessageMeta(message)
    );
    const ids = aquarius.guildManager.get(message.guild.id).ignoredUsers;
    const list = Array.from(ids).map((userId) =>
      getNickname(message.guild, userId)
    );

    message.channel.send(`I'm ignoring ${humanize(list.sort())}.`);
    analytics.trackUsage('list', message);
  });
};
