import { startLoading, stopLoading } from '@aquarius/loading';
import Sentry from '@aquarius/sentry';
import debug from 'debug';
import Discord from 'discord.js';
import fetch from 'node-fetch';

// CJS / ESM compatibility
const { Permissions } = Discord;

const log = debug('Hearthstone');

export const info = {
  name: 'hearthstone',
  description: 'Posts images for linked Hearthstone cards.',
  permissions: [Permissions.FLAGS.ATTACH_FILES],
  usage: "```It was funny when Sintolol milled [[Shudderwock]] wasn't it?```",
  disabled: true, // For some reason the API links to images that 404. This needs to be fixed
};

const API = 'https://omgvamp-hearthstone-v1.p.mashape.com';

async function getCard(name) {
  const response = await fetch(`${API}/cards/${name}?collectible=1`, {
    headers: {
      'X-Mashape-Key': process.env.HEARTHSTONE_KEY,
    },
  });

  return response.json();
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onDynamicTrigger(
    info,
    (message) => aquarius.triggers.bracketTrigger(message),
    async (message, cardList) => {
      log(
        `Retrieving entries for: ${cardList
          .map((match) => match.groups.name)
          .join(', ')}`
      );

      startLoading(message.channel);
      try {
        const responses = await Promise.all(
          cardList.map((card) => getCard(card.groups.name))
        );
        const images = responses.reduce((list, json) => {
          if (json && !json.error) {
            const [entry] = json;
            list.push(entry.img);
          }

          return list;
        }, []);

        if (images.length > 0) {
          const check = aquarius.permissions.check(
            message.guild,
            ...info.permissions
          );

          if (!check.valid) {
            log('Invalid permissions');
            message.channel.send(
              aquarius.permissions.getRequestMessage(check.missing)
            );
          } else {
            message.channel.send({ files: images });
            analytics.trackUsage('card link', message);
          }
        }
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }

      stopLoading(message.channel);
    }
  );
};
