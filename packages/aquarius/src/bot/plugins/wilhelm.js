import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import path from 'path';
import { getDirname } from '../../core/helpers/files';
import { FIVE_MINUTES, ONE_HOUR, ONE_MINUTE } from '../../core/helpers/times';

const log = debug('Wilhelm');

const WILHELM_SCREAM = path.join(
  getDirname(import.meta.url),
  '../../../data/wilhelm/WilhelmScreap.mp3'
);

const INTERVALS = new Map();

// May require discord.js v12:
// https://github.com/discordjs/discord.js/issues/2820
// https://github.com/discordjs/discord.js/issues/3362
export const info = {
  name: 'wilhelm',
  description:
    'Will occassionaly Wilhelm Scream at a specific user (Sorry Shaun)',
  disabled: true,
};

function getRandomInterval() {
  // In minutes
  const min = 30;
  const max = 180;

  const target = Math.round(Math.random() * (max - min)) + min;
  return ONE_MINUTE * target;
}

async function playClip(channel, target, analytics) {
  let dispatcher = null;

  const connection = await channel.join();

  log('Waiting for activity');

  const inactivityCheck = setTimeout(connection.disconnect, FIVE_MINUTES);

  connection.on('speaking', (user, speaking) => {
    if (user.id === target && speaking && dispatcher === null) {
      log('Playing Clip');
      try {
        dispatcher = connection.playFile(WILHELM_SCREAM);

        analytics.track('wilhelm', 'scream', 'play', {
          guildId: channel.guild.id,
          userId: user.id,
        });

        dispatcher.on('end', () => {
          log('Leaving channel');
          clearTimeout(inactivityCheck);
          setTimeout(() => connection.disconnect(), 3);
        });

        dispatcher.on('error', log);
      } catch (error) {
        Sentry.captureException(error);
        log(error);
      }
    }
  });
}

function voiceCheck(guild, target, analytics) {
  log('Checking for users');

  guild.channels
    .filter((channel) => channel.type === 'voice')
    .forEach((channel) => {
      if (channel.members.some((member) => member.user.id === target)) {
        playClip(channel, target, analytics);
      }
    });

  INTERVALS.set(
    guild.id,
    setTimeout(() => voiceCheck(guild, target, analytics), getRandomInterval())
  );
}

function createLoop(aquarius, settings, analytics) {
  log('Creating checks');

  aquarius.guilds.cache.array().forEach((guild) => {
    if (INTERVALS.has(guild.id)) {
      return;
    }

    if (aquarius.guildManager.get(guild.id).isCommandEnabled(info.name)) {
      const target = settings.get(guild.id, 'target');

      if (target === null) {
        return;
      }

      INTERVALS.set(
        guild.id,
        setTimeout(
          () => voiceCheck(guild, target, analytics),
          getRandomInterval()
        )
      );
    }
  });
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  settings.register('target', 'User ID to Target', null);

  aquarius.on('ready', () =>
    setInterval(() => createLoop(aquarius, settings, analytics), ONE_HOUR)
  );
};
