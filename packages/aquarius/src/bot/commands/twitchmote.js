import { checkBotPermissions } from '@aquarius/permissions';
import Sentry from '@aquarius/sentry';
import debug from 'debug';
import Discord from 'discord.js';
import fetch from 'node-fetch';
import { ONE_HOUR } from '../../core/helpers/times';

// CJS / ESM compatibility
const { Permissions } = Discord;

const log = debug('Twitchmote');

export const info = {
  name: 'twitchmote',
  description: 'Imports global Twitch Emoji.',
  permissions: [Permissions.FLAGS.MANAGE_EMOJIS],
  usage: '```@Aquarius twitchmote add <emoji name>```',
};

const EMOTES = new Map();

function getUrl(id) {
  return `https://static-cdn.jtvnw.net/emoticons/v1/${id}/3.0`;
}

async function getTwitchEmoteList() {
  log('Syncing Twitch Emotes');

  try {
    const response = await fetch(
      'https://api.twitchemotes.com/api/v4/channels/0'
    );

    const json = await response.json();

    json.emotes.forEach((emoji) => EMOTES.set(emoji.code, getUrl(emoji.id)));
  } catch (error) {
    log(`Error syncing Twitch Emotes`);
    Sentry.captureException(error);
  }
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('ready', () => {
    getTwitchEmoteList();

    setInterval(getTwitchEmoteList, ONE_HOUR);
  });

  aquarius.onCommand(
    /^twitchmote add (?<name>.+)$/i,
    async (message, { groups }) => {
      if (!message.member.hasPermission(Permissions.FLAGS.MANAGE_EMOJIS)) {
        message.channel.send(
          "You don't have permission to edit emoji on this server!"
        );
        return;
      }

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      if (!EMOTES.has(groups.name)) {
        message.channel.send(
          "Sorry, I wasn't able to find that emote. Please check your spelling (emotes are case sensitive!)"
        );
        return;
      }

      try {
        const emote = await message.guild.emojis.create(
          EMOTES.get(groups.name),
          groups.name
        );

        message.channel.send(`I've imported ${emote}!`);
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        message.channel.send("Sorry, I wasn't able to import the emoji :sad:");
      }

      analytics.trackUsage('twitchmote', message);
    }
  );
};
