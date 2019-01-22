import debug from 'debug';
import { formatDistance } from 'date-fns';
import { getNickname } from '../../lib/core/users';
import database from '../../lib/database';
import { MENTION_USER } from '../../lib/helpers/regex';

const log = debug('Seen');

export const info = {
  name: 'seen',
  description: 'Tracks when a user was last online.',
  usage: '```@Aquarius seen <@User>```',
};

async function updateLastSeen(user) {
  return database.lastSeen.findAndModify({
    query: {
      userId: user.id,
    },
    update: {
      $set: {
        lastSeen: Date.now(),
      },
    },
    upsert: true,
  });
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // Presence change event triggers once per guild
  const statusDebounce = new Set();

  aquarius.onCommand(
    new RegExp(`^seen ${MENTION_USER.source}$`, 'i'),
    async (message) => {
      const user = message.mentions.users.first();
      log(`Request for ${user.username}`);

      if (user.presence.status !== 'offline') {
        message.channel.send("They're online right now!");
      } else {
        const lastSeen = await database.lastSeen.findOne({
          userId: user.id,
        });

        if (!lastSeen) {
          message.channel.send(`I don't know when ${user} was last online. Sorry!`);
        } else {
          message.channel.send(`${user} was last seen ${formatDistance(lastSeen.lastSeen, new Date(), { addSuffix: true })}`);
        }
      }

      analytics.trackUsage('seen', message);
    }
  );

  aquarius.on('presenceUpdate', async (oldMember, newMember) => {
    if (newMember.presence.status === 'offline' && !statusDebounce.has(newMember.user.id)) {
      statusDebounce.add(newMember.user.id);
      log(`${getNickname(newMember.guild, newMember)} signed off`);
      await updateLastSeen(newMember.user);

      setTimeout(
        () => statusDebounce.delete(newMember.user.id),
        500
      );
    }
  });
};
