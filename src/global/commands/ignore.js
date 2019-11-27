import debug from 'debug';
import dedent from 'dedent-js';
import { MENTION } from '../../lib/helpers/regex';
import { humanize } from '../../lib/helpers/lists';
import { getNickname } from '../../lib/core/users';

const log = debug('Ignore');

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
    async message => {
      if (aquarius.permissions.isGuildAdmin(message.guild, message.author)) {
        if (message.mentions.users.size > 0) {
          const user = message.mentions.users.last();
          log(`Adding ${user.username} to ${message.guild.name}'s ignore list`);

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
    async message => {
      if (aquarius.permissions.isGuildAdmin(message.guild, message.author)) {
        if (message.mentions.users.size > 0) {
          const user = message.mentions.users.last();
          log(`Removing ${user.name} from ${message.guild.name}'s ignore list`);

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

  aquarius.onCommand(/^ignore list$/i, async message => {
    log(`Generating list for ${message.guild.name}`);
    const ids = aquarius.guildManager.get(message.guild.id).ignoredUsers;
    const list = Array.from(ids).map(userId =>
      getNickname(message.guild, userId)
    );

    message.channel.send(`I'm ignoring ${humanize(list.sort())}.`);
    analytics.trackUsage('list', message);
  });
};
