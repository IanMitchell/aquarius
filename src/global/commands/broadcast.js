import { Constants } from 'discord.js';
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

  if (aquarius && aquarius.user) {
    log('Setting game to generic instructions');

    if (msg) {
      aquarius.user.setActivity(msg);
      return;
    }

    const setting = await aquarius.database
      .collection('settings')
      .doc('BROADCAST')
      .get();
    msg = setting.exists && setting.data().value;

    if (!msg) {
      msg = 'Type `.info` for info';
      aquarius.database
        .collection('settings')
        .doc('BROADCAST')
        .set({ value: msg });
    }

    aquarius.user.setActivity(msg);
  } else {
    log('ERROR: No Aquarius User');
  }
}

function setStreaming(aquarius, game) {
  aquarius.user.setActivity(game.name, {
    url: game.url,
    type: Constants.ActivityTypes.STREAMING,
  });
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^broadcast (?<message>.*)$/i,
    async (message, { groups }) => {
      if (aquarius.permissions.isBotOwner(message.author)) {
        log(`Setting Broadcast Message to ${groups.message}`);

        aquarius.database
          .collection('settings')
          .doc('BROADCAST')
          .set({ value: groups.message });

        setBroadcastMessage(aquarius, groups.message);
        message.channel.send('Updated my broadcast message');

        analytics.trackUsage('broadcast message');
      }
    }
  );

  aquarius.on('presenceUpdate', async (oldUser, newUser) => {
    if (newUser.id !== aquarius.config.owner) {
      return;
    }

    // No game change means we don't update
    if (!(oldUser.presence.game && newUser.presence.game)) {
      return;
    }

    // User signs off, end a stream
    if (newUser.presence.status === 'offline') {
      log('Ending Stream Broadcast');

      setBroadcastMessage(aquarius);
      analytics.trackUsage('broadcast twitch');
    }

    // User signs on while streaming, broadcast it
    if (
      oldUser.presence.status === 'offline' &&
      newUser.presence.status !== 'offline' &&
      newUser.presence.game.streaming
    ) {
      log('Broadcasting Stream');

      setStreaming(aquarius, newUser.presence.game);
      analytics.trackUsage('broadcast twitch');
      return;
    }

    // If owner starts streaming, advertise it.
    if (!oldUser.presence.game.streaming && newUser.presence.game.streaming) {
      log('Broadcasting Stream');

      setStreaming(aquarius, newUser.presence.game);
      analytics.trackUsage('broadcast twitch');
      return;
    }

    // If a user stops streaming, also stop.
    if (oldUser.presence.game.streaming && !newUser.presence.game.streaming) {
      log('Ending Stream Broadcast');

      setBroadcastMessage(aquarius);
      analytics.trackUsage('broadcast twitch');
    }
  });

  aquarius.on('ready', () => setBroadcastMessage(aquarius));
};
