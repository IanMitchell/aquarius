import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import { Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { ONE_HOUR } from '../../core/helpers/times';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Twitchmote');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'twitchmote',
  description: 'Imports global Twitch Emoji.',
  permissions: [Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS],
  usage: '```@Aquarius twitchmote add <emoji name>```',
};

const EMOTES = new Map();

function getUrl(id) {
  return `https://static-cdn.jtvnw.net/emoticons/v1/${id}/3.0`;
}

async function getTwitchEmoteList() {
  log.info('Syncing Twitch Emotes');

  try {
    const response = await fetch(
      'https://api.twitchemotes.com/api/v4/channels/0'
    );

    const json = await response.json();

    json.emotes.forEach((emoji) => EMOTES.set(emoji.code, getUrl(emoji.id)));
  } catch (error) {
    log.error(`Error syncing Twitch Emotes`, { error: error.message });
    Sentry.captureException(error);
  }
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.on('ready', () => {
    getTwitchEmoteList();

    setInterval(getTwitchEmoteList, ONE_HOUR);
  });

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^twitchmote add (?<name>.+)$/i,
    async (message, { groups }) => {
      if (
        !message.member.permissions.has(
          Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS
        )
      ) {
        message.channel.send(
          "You don't have permission to edit emoji on this server!"
        );
        return;
      }

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.warn('Invalid permissions', getMessageMeta(message));
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
        log.error(error.message);
        Sentry.captureException(error);

        message.channel.send("Sorry, I wasn't able to import the emoji :sad:");
      }

      analytics.trackUsage('twitchmote', message);
    }
  );
};
