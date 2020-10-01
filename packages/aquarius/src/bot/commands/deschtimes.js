import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import formatDistance from 'date-fns/formatDistance';
import debug from 'debug';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import FormData from 'form-data';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import { getEmbedColorFromHex } from '../../core/helpers/colors';
import { ONE_HOUR } from '../../core/helpers/times';
import { getBotOwner } from '../../core/helpers/users';

const log = debug('Deschtimes');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'deschtimes',
  description: 'Read and Update your Deschtimes database from Discord',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **Blame**:
    \`\`\`@Aquarius blame <show>\`\`\`

    **Airing**:
    \`\`\`@Aquarius airing\`\`\`

    **Update Staff**
    \`\`\`@Aquarius <done|undone> <position> <show>\`\`\`

    **Mark as Released**
    \`\`\`@Aquarius release <show>\`\`\`
  `,
};

const SHOWTIMES = {
  SERVER: process.env.SHOWTIMES_SERVER,
  KEY: process.env.SHOWTIMES_KEY,
};

const POSTER_CACHE = new NodeCache({
  stdTTL: ONE_HOUR / 1000,
  checkperiod: 0,
});

async function getPosterInfo(name) {
  if (POSTER_CACHE.has(name)) {
    return POSTER_CACHE.get(name);
  }

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
      query ($search: String) {
        Media(search: $search, format_in: [TV, TV_SHORT, OVA, ONA, MOVIE]) {
          coverImage {
            extraLarge
            color
          }
        }
      }
      `,
      variables: {
        search: name,
      },
    }),
  });

  const json = await response.json();

  if (json?.data?.Media?.coverImage?.extraLarge) {
    const embedInfo = {
      thumbnail: json.data.Media.coverImage.extraLarge,
      color: json.data.Media.coverImage.color,
    };

    POSTER_CACHE.set(name, embedInfo);
    return embedInfo;
  }

  return null;
}

async function createShowEmbed(show, posterInfo) {
  const owner = await getBotOwner();

  const embed = new MessageEmbed()
    .setTitle(`${show.name} #${show.episode}`)
    .setColor(0x008000)
    .setFooter(
      'Brought to you by Deschtimes™',
      owner.avatarURL({ format: 'png' })
    );

  if (posterInfo) {
    embed.setColor(getEmbedColorFromHex(posterInfo.color));
    embed.setThumbnail(posterInfo.thumbnail);
  }

  const positions = new Map();

  show.status.forEach((staff) => {
    // Pending takes precedence
    if (staff.finished && !positions.has(staff.acronym)) {
      positions.set(staff.acronym, `~~${staff.acronym}~~`);
    } else if (!staff.finished) {
      positions.set(staff.acronym, `**${staff.acronym}**`);
    }
  });

  embed.addField('Status', Array.from(positions.values()).join(' '));

  const updatedDate = new Date(show.updated_at);
  const airDate = new Date(show.air_date);

  if (updatedDate > airDate) {
    embed.addField(
      'Last Update',
      formatDistance(updatedDate, new Date(), { addSuffix: true })
    );
  } else if (airDate > Date.now()) {
    embed.addField(
      'Airs',
      formatDistance(airDate, new Date(), { addSuffix: true })
    );
  } else {
    embed.addField(
      'Aired',
      formatDistance(airDate, new Date(), { addSuffix: true })
    );
  }

  return embed;
}

async function getShowData(guildId, show) {
  const url = new URL(`${SHOWTIMES.SERVER}/blame.json`);
  url.searchParams.append('platform', 'discord');
  url.searchParams.append('channel', guildId);
  url.searchParams.append('show', encodeURIComponent(show));

  const response = await fetch(url);
  return response.json();
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^blame (?<show>.+)$/i, async (message, { groups }) => {
    log(`Blame request for ${groups.show}`);

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log('Invalid permissions');
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      const data = await getShowData(message.guild.id, groups.show.trim());

      if (data.message) {
        log(`Error: ${data.message}`);
        message.channel.send(data.message);
        return;
      }

      const posterInfo = await getPosterInfo(data.name);
      const embed = await createShowEmbed(data, posterInfo);

      message.channel.send(embed);
      analytics.trackUsage('blame', message);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    }
  });

  aquarius.onCommand(
    /^(?:(?:(?<status>done|undone) (?<position>tl|tlc|enc|ed|tm|ts|qc) (?<show>.+)))$/i,
    async (message, { groups }) => {
      log(`Status update for ${groups.show}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      try {
        const body = new FormData();
        body.append('username', message.author.id);
        body.append('platform', 'discord');
        body.append('channel', message.guild.id);
        body.append('status', groups.status === 'done' ? 'true' : 'false');
        body.append('name', groups.show.trim());
        body.append('position', groups.position);
        body.append('auth', SHOWTIMES.KEY);

        const response = await fetch(`${SHOWTIMES.SERVER}/staff`, {
          method: 'PUT',
          body,
        });
        const data = await response.json();

        if (!response.ok) {
          log(`Error: ${data.message}`);
          message.channel.send(data.message);
          return;
        }

        message.channel.send(data.message);

        const showData = await getShowData(
          message.guild.id,
          groups.show.trim()
        );

        if (showData.message) {
          return;
        }

        const posterInfo = await getPosterInfo(showData.name);
        const embed = await createShowEmbed(showData, posterInfo);

        message.channel.send(embed);
        analytics.trackUsage('status', message);
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        const owner = await getBotOwner();
        message.channel.send(
          `Sorry, there was a problem. ${owner} might be able to help!`
        );
      }
    }
  );

  aquarius.onCommand(/^release\s(?<show>.+)$/i, async (message, { groups }) => {
    log(`Marking ${groups.show} as done`);

    try {
      const body = new FormData();
      body.append('platform', 'discord');
      body.append('channel', message.guild.id);
      body.append('name', groups.show.trim());
      body.append('username', message.author.id);
      body.append('auth', SHOWTIMES.KEY);

      const response = await fetch(`${SHOWTIMES.SERVER}/release`, {
        method: 'PUT',
        body,
      });
      const data = await response.json();

      message.channel.send(data.message);
      analytics.trackUsage('release', message);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    }
  });

  // TODO: Deprecate and move into `.anime airing <show>`
  aquarius.onCommand(/^airing$/i, async (message) => {
    log('Airing request');

    try {
      const uri = `${SHOWTIMES.SERVER}/shows.json?platform=discord&channel=${message.guild.id}`;

      const response = await fetch(uri);
      const data = await response.json();

      if (data.message) {
        log(`Error: ${data.message}`);
        message.channel.send(data.message);
        return;
      }

      if (data.shows.length === 0) {
        message.channel.send('No more airing shows this season!');
        return;
      }

      const msg = data.shows.reduce(
        (str, show) =>
          str +
          dedent`
          **${show.name}** #${show.episode_number}
          Airs ${formatDistance(new Date(show.air_date), new Date(), {
            addSuffix: true,
          })}.\n\n
        `,
        ''
      );

      message.channel.send(msg);
      analytics.trackUsage('airing', message);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    }
  });
};
