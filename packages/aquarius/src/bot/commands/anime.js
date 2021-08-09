import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import dateFns from 'date-fns';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import downsize from 'downsize';
import fetch from 'node-fetch';
import Turndown from 'turndown';
import { getEmbedColorFromHex } from '../../core/helpers/colors';
import getLogger from '../../core/logging/log';

const log = getLogger('Anime');

// CJS / ESM compatibility
const { formatDistance } = dateFns;

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'anime',
  description: 'Anime related commands such as show lookups.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **Look Up Show:**
    \`\`\`@Aquarius anime info <name>\`\`\`
  `,
};

const TURNDOWN = new Turndown();
const ANILIST_API = 'https://graphql.anilist.co';
const INFO_QUERY = `
  query ($search: String, $nsfw: Boolean!) {
    sfw: Media(search: $search, isAdult: false, format_in: [TV, TV_SHORT, OVA, ONA, MOVIE]) @skip(if: $nsfw) {
      ...AnimeInfo
    }
    nsfw: Media(search: $search, format_in: [TV, TV_SHORT, OVA, ONA, MOVIE]) @include(if: $nsfw) {
      ...AnimeInfo
    }
  }

  fragment AnimeInfo on Media {
    id
    title {
      romaji
      english
    }
    description
    nextAiringEpisode {
      airingAt
      timeUntilAiring
    }
    coverImage {
      extraLarge
      color
    }
  }
`;

function createAnimeEmbed(data) {
  if (!data?.data?.sfw && !data?.data?.nsfw) {
    return null;
  }

  const show = data.data.sfw ?? data.data.nsfw;
  const { title } = show;

  const embed = new MessageEmbed({
    title: title.english ? title.english : title.romaji,
    url: `https://anilist.co/anime/${show.id}`,
    footer: {
      icon_url: 'https://anilist.co/img/icons/favicon-32x32.png',
      text: 'Brought to you by AniList.co',
    },
    thumbnail: {
      url: show.coverImage.extraLarge,
      width: 200,
      height: 295,
    },
    fields: [
      {
        name: 'Description:',
        value: downsize(TURNDOWN.turndown(show.description), {
          characters: 1023,
          append: '…',
        }),
      },
    ],
  });

  if (show?.coverImage?.color) {
    embed.setColor(getEmbedColorFromHex(show.coverImage.color));
  }

  if (show.nextAiringEpisode) {
    const target = new Date(
      Date.now() + show.nextAiringEpisode.timeUntilAiring * 1000
    );

    embed.addField(
      'Time until next episode:',
      `${formatDistance(target, new Date())} (${target.toLocaleString('en-US', {
        weekday: 'long',
      })} at ${target.getUTCHours()}:${target
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')} UTC)`,
      true
    );
  }

  return embed;
}

export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(
    /^anime info (?<show>.+)$/i,
    async (message, { groups }) => {
      log.info(`Info for ${groups.show}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.info('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      try {
        const response = await fetch(ANILIST_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: INFO_QUERY,
            variables: {
              search: groups.show,
              nsfw: message.channel.nsfw,
            },
          }),
        });

        const data = await response.json();
        const embed = await createAnimeEmbed(data);

        analytics.trackUsage('info', message);

        if (!embed) {
          message.channel.send("I wasn't able to find that show!");
          return;
        }

        message.channel.send({ embeds: [embed] });
      } catch (error) {
        log.error(error);
        Sentry.captureException(error);
        message.channel.send('Sorry, something went wrong');
      }
    }
  );
};
