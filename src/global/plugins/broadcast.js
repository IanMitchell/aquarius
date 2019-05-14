import { Constants } from 'discord.js';
import debug from 'debug';

const log = debug('Broadcast');

// TODO: Maybe dictate what the bot is currently playing on a `.broadcast` command?
export const info = {
  name: 'broadcast',
  hidden: true,
  description: "Advertises the Owner's Twitch stream",
};

function setGenericMessage(aquarius) {
  if (aquarius && aquarius.user) {
    log('Setting game to generic instructions');

    aquarius.user.setActivity('Type `.info` for info', {
      type: Constants.ActivityTypes.LISTENING,
    });
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

      setGenericMessage(aquarius);
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

      setGenericMessage(aquarius);
      analytics.trackUsage('broadcast twitch');
    }
  });

  aquarius.on('ready', () => setGenericMessage(aquarius));
};
