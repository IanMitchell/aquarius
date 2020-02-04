import { getOrderedMentions } from '@aquarius/messages';
import { MENTION_USER } from '@aquarius/regex';
import { getNickname } from '@aquarius/users';
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
  // Presence change event triggers once per guild
  const statusDebounce = new Set();

  aquarius.onCommand(
    new RegExp(`^seen ${MENTION_USER.source}$`, 'i'),
    async message => {
      const [user] = getOrderedMentions(message);
      log(`Request for ${user.username}`);

      if (user.presence.status !== 'offline') {
        message.channel.send("They're online right now!");
      } else {
        const lastSeen = await aquarius.database.lastSeen.doc(user.id).get();

        if (!lastSeen.exists) {
          message.channel.send(
            `I don't know when ${user} was last online. Sorry!`
          );
        } else {
          const data = lastSeen.data();
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

  aquarius.on('presenceUpdate', async (oldMember, newMember) => {
    if (
      newMember.presence.status === 'offline' &&
      !statusDebounce.has(newMember.user.id)
    ) {
      statusDebounce.add(newMember.user.id);
      log(`${getNickname(newMember.guild, newMember)} signed off`);

      await aquarius.database.lastSeen
        .doc(newMember.user.id)
        .set({ lastSeen: Date.now() });

      setTimeout(() => statusDebounce.delete(newMember.user.id), 500);
    }
  });
};
