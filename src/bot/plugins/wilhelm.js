import path from 'path';
import debug from 'debug';

const log = debug('Wilhelm');

const WILHELM_SCREAM = path.join(__dirname, '../../../data/wilhelm/WilhelmScreap.mp3');

// TODO: Write Info, test, analytics, enable
// May require discord.js v12: https://github.com/discordjs/discord.js/issues/2820
export const info = {
  name: 'Wilhelm',
  description: 'Will occassionaly Wilhelm Scream at a specific user (Sorry Shaun)',
  disabled: true,
};

function getRandomInterval() {
  // In minutes
  const min = 30;
  const max = 180;

  const target = Math.round(Math.random() * (max - min)) + min;
  return 1000 * 60 * target;
}

async function playClip(channel, target) {
  let dispatcher = null;

  const connection = await channel.join();

  log('Waiting for activity');

  // Disconnect after 5m of inactivity
  const inactivityCheck = setTimeout(connection.disconnect, 1000 * 60 * 5);

  connection.on('speaking', (user, speaking) => {
    if (user.id === target && speaking && dispatcher === null) {
      log('Playing Clip');
      try {
        dispatcher = connection.playFile(WILHELM_SCREAM);

        dispatcher.on('end', () => {
          log('Leaving channel');
          clearTimeout(inactivityCheck);
          connection.disconnect();
        });

        dispatcher.on('error', log);
      } catch (error) {
        log(error);
      }
    }
  });
}

function voiceCheck(aquarius, settings) {
  log('Checking for users');
  aquarius.guilds.forEach(guild => {
    if (aquarius.guildManager.get(guild.id).isCommandEnabled('wilhelm')) {
      const target = settings.get(guild.id, 'target');

      if (target === null) {
        return;
      }

      guild.channels.findAll('type', 'voice').forEach(channel => {
        if (channel.members.some(member => member.user.id === target)) {
          playClip(channel, target);
        }
      });
    }
  });

  setTimeout(
    () => voiceCheck(aquarius, settings),
    getRandomInterval()
  );
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings }) => {
  settings.register('target', 'User ID to Target', null);

  aquarius.on('ready', () => {
    setTimeout(
      () => voiceCheck(aquarius, settings),
      getRandomInterval()
    );
  });
};
