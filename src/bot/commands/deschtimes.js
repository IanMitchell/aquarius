import debug from 'debug';
import dedent from 'dedent-js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { RichEmbed, Permissions } from 'discord.js';
import formatDistance from 'date-fns/formatDistance';
import { getBotOwner } from '../../lib/core/users';

const log = debug('Deschtimes');

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

const TVDB_URL = 'https://api.thetvdb.com';
const SHOWTIMES = {
  SERVER: process.env.SHOWTIMES_SERVER,
  KEY: process.env.SHOWTIMES_KEY,
};
const POSTER_CACHE = new Map();

async function connectToTVDB() {
  const response = await fetch(`${TVDB_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apikey: process.env.TVDB_API_KEY,
    }),
  });

  const json = await response.json();

  if (!json.token) {
    throw new Error('Could not connect to TVDB API');
  }

  return json.token;
}

async function getShowPoster(name) {
  if (POSTER_CACHE.has(name)) {
    return POSTER_CACHE.get(name);
  }

  try {
    // TODO: Can we cache this?
    const token = await connectToTVDB();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const seriesResponse = await fetch(
      `${TVDB_URL}/search/series?name=${name}`,
      {
        headers,
      }
    );
    const seriesJson = await seriesResponse.json();

    if (!seriesJson.data) {
      return null;
    }

    // TODO: We should add support to set this in Showtimes so we can skip
    // a network call
    const { id } = seriesJson.data[0];

    const response = await fetch(
      `${TVDB_URL}/series/${id}/images/query?keyType=poster`,
      {
        headers,
      }
    );
    const json = await response.json();

    const results = json.data.sort(
      (a, b) => a.ratingsInfo.average < b.ratingsInfo.average
    );

    const url = `https://thetvdb.com/banners/${results[0].fileName}`;

    POSTER_CACHE.set(name, url);
    return url;
  } catch (error) {
    log(error);
  }

  return null;
}

async function createShowEmbed(show) {
  const owner = await getBotOwner();
  const thumbnail = await getShowPoster(show.tvdb_name || show.name);

  // TODO: Change width and height?
  const embed = new RichEmbed({
    title: `${show.name} #${show.episode}`,
    color: 0x008000,
    footer: {
      icon_url: owner.avatarURL,
      text: 'Brought to you by Deschtimes™',
    },
    thumbnail: {
      url: thumbnail,
      width: 200,
      height: 295,
    },
  });

  const positions = new Map();

  show.status.forEach(staff => {
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

      const data = await getShowData(message.guild.id, groups.show.trim());

      if (data.message) {
        log(`Error: ${data.message}`);
        message.channel.send(data.message);
        return;
      }

      const embed = await createShowEmbed(data);
      message.channel.send(embed);
      analytics.trackUsage('blame', message);
    } catch (error) {
      log(error);
      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    } finally {
      aquarius.loading.stop(message.channel);
    }
  });

  aquarius.onCommand(
    /^(?:(?:(?<status>done|undone) (?<position>tl|tlc|enc|ed|tm|ts|qc) (?<show>.+)))$/i,
    async (message, { groups }) => {
      log(`Status update for ${groups.show}`);

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

        const embed = await createShowEmbed(showData);
        message.channel.send(embed);
        analytics.trackUsage('status', message);
      } catch (error) {
        log(error);
        const owner = await getBotOwner();
        message.channel.send(
          `Sorry, there was a problem. ${owner} might be able to help!`
        );
      } finally {
        aquarius.loading.stop(message.channel);
      }
    }
  );

  aquarius.onCommand(/^release\s(?<show>.+)$/i, async (message, { groups }) => {
    log(`Marking ${groups.show} as done`);

    try {
      aquarius.loading.start(message.channel);

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
      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    } finally {
      aquarius.loading.stop(message.channel);
    }
  });

  // TODO: Deprecate and move into `.anime airing <show>`
  aquarius.onCommand(/^airing$/i, async message => {
    log('Airing request');

    try {
      aquarius.loading.start(message.channel);

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
      const owner = await getBotOwner();
      message.channel.send(
        `Sorry, there was a problem. ${owner} might be able to help!`
      );
    } finally {
      aquarius.loading.stop(message.channel);
    }
  });
};
