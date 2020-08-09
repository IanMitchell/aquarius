import debug from 'debug';
import dedent from 'dedent-js';
import { Permissions } from 'discord.js';
import { getDocsLink } from '../../core/helpers/links';
import { getBotOwner } from '../../core/helpers/users';

const log = debug('Greeting');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'greeting',
  hidden: true,
  description:
    'Sends Admins information about Aquarius when it joins a new server.',
};

async function getWelcomeMessage(guild) {
  const owner = await getBotOwner();
  const user = `${owner.username}#${owner.discriminator}`;

  return dedent`
    Hey! My name is Aquarius - I'm a general purpose Discord bot. I was just added to ${
      guild.name
    } and wanted to introduce myself!

    You can read more about me and how to add commands here: ${getDocsLink()}.

    If you have any questions or concerns reach out to ${user} (@IanMitchel1).
  `;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('guildCreate', async (guild) => {
    const message = await getWelcomeMessage(guild);
    const count = { success: 0, failure: 0 };

    log('Sending message');

    guild.members.cache
      .filter((member) => member.hasPermission(Permissions.FLAGS.ADMINISTRATOR))
      .array()
      .forEach(async (member) => {
        try {
          await member.send(message);
          count.success += 1;
        } catch (error) {
          count.failure += 1;
        }
      });

    analytics.trackUsage('greeting', null, {
      guildId: guild.id,
      guildName: guild.name,
      admins: count.success + count.failure,
      failures: count.failure,
    });
  });
};
