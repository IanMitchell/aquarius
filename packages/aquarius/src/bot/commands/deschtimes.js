import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import formatDistance from 'date-fns/formatDistance';
import debug from 'debug';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { getIconColor } from '../../core/helpers/colors';
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

    **Update Staff**
    \`\`\`@Aquarius <done|undone> <position> <show>\`\`\`

    **Update Future Episode**
    \`\`\`@Aquarius <done|undone> <position> #<episode number> <show>\`\`\`

    **Mark as Released**
    \`\`\`@Aquarius release <show>\`\`\`
  `,
};

async function getShowEmbed(data, episodeNumber) {
  let episode = null;

  if (episodeNumber) {
    episode = data.episodes.find((ep) => ep.number === episodeNumber);
  } else {
    [episode] = data.episodes
      .filter((ep) => !ep.released)
      .sort((a, b) => a.number - b.number);
  }

  const embed = new MessageEmbed()
    .setAuthor('Deschtimes', null, 'https://deschtimes.com')
    .setTitle(`${data.name} #${episode.number}`)
    .setColor(0x008000);

  if (data.poster) {
    const color = await getIconColor(data.poster);
    embed.setColor(color);
    embed.setThumbnail(data.poster);
  }

  embed.addField(
    'Status',
    episode.staff
      .map((staff) => {
        if (staff.finished) {
          return `~~${staff.position.acronym}~~`;
        }

        return `**${staff.position.acronym}**`;
      })
      .join(' ')
  );

  const updatedDate = new Date(data.updated_at);
  const airDate = new Date(episode.air_date);

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

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics, settings }) => {
  settings.register('token', "Your Group's Deschtimes token", 0);

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
      const token = settings.get(message.guild.id, 'token');
      // const response = await fetch(
      //   `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
      //     groups.show
      //   )}.json`
      // );
      const response = await fetch(
        `http://localhost:3000/api/v1/groups/${token}/shows/${encodeURIComponent(
          groups.show
        )}.json`
      );
      const data = await response.json();

      if (data.message) {
        log(`Error: ${data.message}`);
        message.channel.send(data.message);
        return;
      }

      const embed = await getShowEmbed(data);
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
    /^(?:(?:(?<status>done|undone) (?<position>\w+)(?: \#(?<episode>\d+))? (?<show>.+)))$/i,
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
        const token = settings.get(message.guild.id, 'token');
        // const url = new URL(
        //   `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
        //     groups.show
        //   )}.json`
        // );
        const url = new URL(
          `http://localhost:3000/api/v1/groups/${token}/shows/${encodeURIComponent(
            groups.show
          )}/staff`
        );
        url.searchParams.append('finished', groups.status === 'done');
        url.searchParams.append('member', message.author.id);
        url.searchParams.append(
          'position',
          encodeURIComponent(groups.position)
        );

        if (groups.episode) {
          url.searchParams.append(
            'episode_number',
            encodeURIComponent(groups.episode)
          );
        }

        const response = await fetch(url, {
          method: 'PATCH',
        });
        const data = await response.json();

        if (response.ok) {
          const embed = await getShowEmbed(data, parseInt(groups.episode, 10));
          message.channel.send(embed);
        } else {
          message.channel.send(data.message);
        }

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
      const token = settings.get(message.guild.id, 'token');
      // const url = new URL(
      //   `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
      //     groups.show
      //   )}.json`
      // );
      const url = new URL(
        `http://localhost:3000/api/v1/groups/${token}/shows/${encodeURIComponent(
          groups.show
        )}/episodes`
      );
      url.searchParams.append('member', message.author.id);

      const response = await fetch(url, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (response.ok) {
        const embed = await getShowEmbed(data);
        message.channel.send('Episode released!', embed);
      } else {
        message.channel.send(data.message);
      }

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
};
