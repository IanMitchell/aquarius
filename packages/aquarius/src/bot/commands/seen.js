import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION_USER } from '@aquarius-bot/regex';
import { getNickname } from '@aquarius-bot/users';
import chalk from 'chalk';
import dateFns from 'date-fns';
import dedent from 'dedent-js';
import getLogger, {
  getMessageMeta,
  getPresenceMeta,
} from '../../core/logging/log';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = getLogger('Seen');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'seen',
  description: 'Tracks when a user was last online.',
  usage: dedent`
    **Mention Lookup**
    \`\`\`@Aquarius seen <@User>\`\`\`

    **ID Lookup**
    \`\`\`@Aquarius seen id <user id>\`\`\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // The presence change event triggers once per guild, and we only want
  // to track one of them
  const statusDebounce = new Set();

  const checkUser = async (user, message) => {
    if (user.presence.status !== 'offline') {
      message.channel.send("They're online right now!");
    } else {
      const data = await aquarius.database.lastSeen.findUnique({
        select: {
          lastSeen: true,
        },
        where: {
          userId: user.id,
        },
      });

      const nickname = await getNickname(message.guild, user);

      if (!data) {
        message.channel.send(
          `I don't know when ${nickname} was last online. Sorry!`
        );
      } else {
        message.channel.send(
          `${nickname} was last seen ${formatDistance(
            data.lastSeen,
            new Date(),
            {
              addSuffix: true,
            }
          )}`
        );
      }
    }
  };

  aquarius.onCommand(
    new RegExp(`^seen ${MENTION_USER.source}$`, 'i'),
    async (message) => {
      const [user] = await getOrderedMentions(message);
      log.info(
        `Request for ${chalk.green(user.username)}`,
        getMessageMeta(message)
      );

      checkUser(user, message);

      analytics.trackUsage('seen', message);
    }
  );

  aquarius.onCommand(
    new RegExp(`^seen id (?<id>\\d+)$`, 'i'),
    async (message, { groups }) => {
      log.info(
        `ID Request for ${chalk.green(groups.id)}`,
        getMessageMeta(message)
      );

      try {
        const member = await message.guild.members.fetch(groups.id);
        checkUser(member.user, message);
      } catch (err) {
        message.channel.send("That user doesn't appear to be in this server!");
      }

      analytics.trackUsage('seen', message);
    }
  );

  aquarius.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (
      newPresence.status === 'offline' &&
      !statusDebounce.has(newPresence.user.id)
    ) {
      statusDebounce.add(newPresence.user.id);
      log.info(
        `${chalk.green(
          getNickname(newPresence.guild, newPresence.user)
        )} signed off`,
        getPresenceMeta(newPresence)
      );

      await aquarius.database.lastSeen.upsert({
        where: {
          userId: newPresence.user.id,
        },
        update: {
          lastSeen: new Date(),
        },
        create: {
          userId: newPresence.user.id,
          lastSeen: new Date(),
        },
      });

      setTimeout(() => statusDebounce.delete(newPresence.user.id), 500);
    }
  });
};
