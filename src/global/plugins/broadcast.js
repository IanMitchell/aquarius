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

// TODO: Check for presence (sign in while bot is on)
// TODO: What if you sign off of discord while streaming?
/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  // aquarius.on('presenceUpdate', async (oldUser, newUser) => {
  //   // If owner starts streaming, advertise it. If they stop, also stop.
  //   if (
  //     newUser.id === aquarius.config.owner
  //     && oldUser.presence.game
  //     && newUser.presence.game
  //   ) {
  //     if (!oldUser.presence.game.streaming && newUser.presence.game.streaming) {
  //       log('Broadcasting Stream');
  //       analytics.trackUsage('twitch owner update');
  //       aquarius.user.setActivity(newUser.presence.game.name, {
  //         url: newUser.presence.game.url,
  //         type: Constants.ActivityTypes.STREAMING,
  //       });
  //     } else if (oldUser.presence.game.streaming && !newUser.presence.game.streaming) {
  //       log('Ending Stream Broadcast');
  //       analytics.trackUsage('twitch owner update');
  //       setGenericMessage(aquarius);
  //     }
  //   }
  // });

  aquarius.on('ready', () => setGenericMessage(aquarius));
};
