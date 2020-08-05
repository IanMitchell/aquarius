import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import { bracketTrigger } from '@aquarius-bot/triggers';
import debug from 'debug';
import { Permissions } from 'discord.js';
import fetch from 'node-fetch';

const log = debug('Magic');

export const info = {
  name: 'magic',
  description: 'Posts images for linked Magic: the Gathering cards.',
  permissions: [Permissions.FLAGS.ATTACH_FILES],
  usage:
    "```The only good planeswalker is [[Jace Beleren]] and that's final```",
};

const API = 'https://api.scryfall.com';

async function getCard(name) {
  // TODO: Switch to URL params
  const response = await fetch(`${API}/cards/search?q=${name}`);
  return response.json();
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onDynamicTrigger(
    info,
    (message) => bracketTrigger(message),
    async (message, cardList) => {
      log(
        `Retrieving entries for: ${cardList
          .map((match) => match.groups.name)
          .join(', ')}`
      );

      try {
        const responses = await Promise.all(
          cardList.map((card) => getCard(card.groups.name))
        );
        const images = responses.reduce((list, json) => {
          if (!json?.status) {
            const [entry] = json.data;
            list.push(entry.image_uris.png);
          }

          return list;
        }, []);

        if (images.length > 0) {
          const check = checkBotPermissions(message.guild, ...info.permissions);

          if (!check.valid) {
            log('Invalid permissions');
            message.channel.send(
              aquarius.permissions.getRequestMessage(check.missing)
            );
            return;
          }

          message.channel.send({
            files: images.map((image) => {
              const link = new URL(image);
              return `${link.origin}${link.pathname}`;
            }),
          });

          analytics.trackUsage('card link', message);
        }
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  );
};
