import debug from 'debug';
import fetch from 'node-fetch';
import dedent from 'dedent-js';
import Turndown from 'turndown';
import downsize from 'downsize';
import { RichEmbed, Permissions } from 'discord.js';
import { formatDistance } from 'date-fns';

const log = debug('Anime');

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
    nsfw:Media(search: $search, format_in: [TV, TV_SHORT, OVA, ONA, MOVIE]) @include(if: $nsfw) {
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
  if (!data || !data.data || (!data.data.sfw && !data.data.nsfw)) {
    return null;
  }

  const show = data.data.sfw || data.data.nsfw;
  const { title } = show;

  const embed = new RichEmbed({
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

  if (show.coverImage && show.coverImage.color) {
    embed.setColor(parseInt(show.coverImage.color.replace('#', ''), 16));
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
  aquarius.onCommand(
    /^anime info (?<show>.+)$/i,
    async (message, { groups }) => {
      log(`Info for ${groups.show}`);

      const check = aquarius.permissions.check(
        message.guild,
        ...info.permissions
      );

      if (!check.valid) {
        log('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      try {
        aquarius.loading.start(message.channel);

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
          aquarius.loading.stop(message.channel);
          return;
        }

        message.channel.send(embed);
      } catch (error) {
        log(error);
        message.channel.send('Sorry, something went wrong');
      }

      aquarius.loading.stop(message.channel);
    }
  );
};
