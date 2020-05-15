import { getOrderedMentions } from '@aquarius-bot/messages';
import { MENTION_USER } from '@aquarius-bot/regex';
import { getNickname } from '@aquarius-bot/users';
import dateFns from 'date-fns';
import debug from 'debug';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

const log = debug('Seen');

export const info = {
  name: 'seen',
  description: 'Tracks when a user was last online.',
  usage: '```@Aquarius seen <@User>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // The presence change event triggers once per guild, and we only want
  // to track one of them
  const statusDebounce = new Set();

  aquarius.onCommand(
    new RegExp(`^seen ${MENTION_USER.source}$`, 'i'),
    async (message) => {
      const [user] = await getOrderedMentions(message);
      log(`Request for ${user.username}`);

      if (user.presence.status !== 'offline') {
        message.channel.send("They're online right now!");
      } else {
        const data = await aquarius.database.lastSeen.findOne({
          select: { lastSeen: true },
          where: { userId: user.id },
        });

        if (!data) {
          message.channel.send(
            `I don't know when ${user} was last online. Sorry!`
          );
        } else {
          message.channel.send(
            `${user} was last seen ${formatDistance(data.lastSeen, new Date(), {
              addSuffix: true,
            })}`
          );
        }
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
      log(`${getNickname(newPresence.guild, newPresence.user)} signed off`);

      await aquarius.database.lastSeen.upsert({
        where: { userId: newPresence.user.id },
        update: { lastSeen: Date.now() },
        create: { userId: newPresence.user.id, lastSeen: Date.now() },
      });

      setTimeout(() => statusDebounce.delete(newPresence.user.id), 500);
    }
  });
};
