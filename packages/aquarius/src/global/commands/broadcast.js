import { getGame, getStream, isStreaming } from '@aquarius-bot/users';
import debug from 'debug';

const log = debug('Broadcast');

export const info = {
  name: 'broadcast',
  hidden: true,
  description:
    "Displays news and announcements and advertises the owner's Twitch stream",
  usage: '```@Aquarius broadcast <message>```',
};

async function setBroadcastMessage(aquarius, message = null) {
  let msg = message;

  if (aquarius?.user) {
    log('Setting game to generic instructions');

    if (msg) {
      aquarius.user.setActivity(msg);
      return;
    }

    const setting = await aquarius.database.setting.findOne({
      select: { value: true },
      where: { key: 'BROADCAST' },
    });

    msg = setting?.value;

    if (!msg) {
      msg = 'Type `.info` for info';
      aquarius.database.setting.update({
        where: { key: 'BROADCAST' },
        data: { value: msg },
      });
    }

    aquarius.user.setActivity(msg);
  } else {
    log('ERROR: No Aquarius User');
  }
}

function setStreaming(aquarius, presence) {
  const game = getGame(presence);
  const stream = getStream(presence);

  aquarius.user.setActivity(game.name, {
    url: stream.url,
    type: 'STREAMING',
  });
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^broadcast (?<message>.*)$/i, (message, { groups }) => {
    if (aquarius.permissions.isBotOwner(message.author)) {
      log(`Setting Broadcast Message to ${groups.message}`);

      aquarius.database.setting.upsert({
        where: { key: 'BROADCAST' },
        create: {
          key: 'BROADCAST',
          value: groups.message,
        },
        update: {
          value: groups.message,
        },
      });

      setBroadcastMessage(aquarius, groups.message);
      message.channel.send('My broadcast message has been updated!');

      analytics.trackUsage('broadcast message');
    }
  });

  aquarius.on('ready', async () => {
    const owner = await aquarius.users.fetch(aquarius.config.owner);

    if (isStreaming(owner.presence)) {
      log('Broadcasting Stream');

      setStreaming(aquarius, owner.presence);
      analytics.trackUsage('broadcast twitch');
    } else {
      setBroadcastMessage(aquarius);
    }
  });

  /**
   * There are four cases to account for:
   *   1. Online + Not Streaming -> Online + Streaming
   *   2. Online + Streaming -> Online + Not Streaming
   *   3. Offline -> Online + Streaming
   *   4. Online + Streaming -> Offline
   */
  aquarius.on('presenceUpdate', (oldPresence, newPresence) => {
    if (newPresence.user.id !== aquarius.config.owner) {
      return;
    }

    // No game change means we don't update
    if (oldPresence && !isStreaming(oldPresence) && !isStreaming(newPresence)) {
      return;
    }

    // User signing off
    if (newPresence.status === 'offline') {
      log('Ending Stream Broadcast');

      setBroadcastMessage(aquarius);
      analytics.trackUsage('broadcast twitch');
    }

    // User signs on while streaming, broadcast it
    if (
      oldPresence?.status === 'offline' &&
      newPresence?.status !== 'offline' &&
      isStreaming(newPresence)
    ) {
      log('Broadcasting Stream');

      setStreaming(aquarius, newPresence);
      analytics.trackUsage('broadcast twitch');
      return;
    }

    // If owner starts streaming, advertise it.
    if (!isStreaming(oldPresence) && isStreaming(newPresence)) {
      log('Broadcasting Stream');

      setStreaming(aquarius, newPresence);
      analytics.trackUsage('broadcast twitch');
      return;
    }

    // If a user stops streaming, also stop.
    if (isStreaming(oldPresence) && !isStreaming(newPresence)) {
      log('Ending Stream Broadcast');

      setBroadcastMessage(aquarius);
      analytics.trackUsage('broadcast twitch');
    }
  });
};
