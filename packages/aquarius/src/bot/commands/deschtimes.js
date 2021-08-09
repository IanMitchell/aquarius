import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import formatDistance from 'date-fns/formatDistance';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { getIconColor } from '../../core/helpers/colors';
import { getBotOwner } from '../../core/helpers/users';
import getLogger from '../../core/logging/log';

const log = getLogger('Deschtimes');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'deschtimes',
  description: 'Read and Update your Deschtimes database from Discord',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **Blame**:
    \`\`\`@Aquarius blame <show>\`\`\`

    **Blame Future Episode**:
    \`\`\`@Aquarius blame #<episode number> <show>\`\`\`

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

  // Account for Episode 0
  if (episodeNumber != null) {
    episode = data.episodes.find((ep) => ep.number === episodeNumber);
  }

  // Account for no set episode or missing episode number
  if (!episode) {
    [episode] = data.episodes
      .filter((ep) => !ep.released)
      .sort((a, b) => a.number - b.number);
  }

  const embed = new MessageEmbed()
    .setAuthor('Deschtimes', null, 'https://deschtimes.com')
    .setColor(0x008000);

  if (data.poster) {
    const color = await getIconColor(data.poster);
    embed.setColor(color);
    embed.setThumbnail(data.poster);
  }

  if (data.status) {
    embed.setDescription(data.status);
  }

  if (!episode) {
    const [lastEpisode] = data.episodes.sort((a, b) => b.number - a.number);

    embed.setTitle(data.name);
    embed.addField(
      'Finished',
      formatDistance(new Date(lastEpisode.updated_at), new Date(), {
        addSuffix: true,
      })
    );

    return embed;
  }

  embed.setTitle(`${data.name} #${episode.number}`);

  if (episode.staff.length > 0) {
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
  }

  const updatedDate = new Date(episode.updated_at);
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

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^blame (?:#(?<episode>\d+) )?(?<show>[^.](?:.+)?)$/i,
    async (message, { groups }) => {
      log.info(`Blame request for ${groups.show}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.info('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      try {
        const token = settings.get(message.guild.id, 'token');
        const response = await fetch(
          `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
            groups.show
          )}.json`
        );
        const data = await response.json();

        if (data.message) {
          log.error(`Error: ${data.message}`);
          message.channel.send(data.message);
          return;
        }

        const embed = await getShowEmbed(data, parseInt(groups.episode, 10));
        message.channel.send({ embeds: [embed] });
        analytics.trackUsage('blame', message);
      } catch (error) {
        log.error(error);
        Sentry.captureException(error);

        const owner = await getBotOwner();
        message.channel.send(
          `Sorry, there was a problem. ${owner} might be able to help!`
        );
      }
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^(?:(?:(?<status>done|undone) (?<position>\w+)(?: #(?<episode>\d+))? (?<show>[^.](?:.+)?)))$/i,
    async (message, { groups }) => {
      log.info(`Status update for ${groups.show}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.info('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      try {
        const token = settings.get(message.guild.id, 'token');
        const url = new URL(
          `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
            groups.show
          )}/staff`
        );
        url.searchParams.append(
          'finished',
          groups.status.toLowerCase() === 'done'
        );
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
          message.channel.send({ embeds: [embed] });
        } else {
          message.channel.send(data.message);
        }

        analytics.trackUsage('status', message);
      } catch (error) {
        log.error(error);
        Sentry.captureException(error);

        const owner = await getBotOwner();
        message.channel.send(
          `Sorry, there was a problem. ${owner} might be able to help!`
        );
      }
    }
  );

  // TODO: Switch to slash command
  aquarius.onCommand(
    /^release\s(?<show>[^.](?:.+)?)$/i,
    async (message, { groups }) => {
      log.info(`Marking ${groups.show} as done`);

      try {
        const token = settings.get(message.guild.id, 'token');
        const url = new URL(
          `https://deschtimes.com/api/v1/groups/${token}/shows/${encodeURIComponent(
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
          message.channel.send({
            content: 'Episode released!',
            embeds: [embed],
          });
        } else {
          message.channel.send(data.message);
        }

        analytics.trackUsage('release', message);
      } catch (error) {
        log.error(error);
        Sentry.captureException(error);

        const owner = await getBotOwner();
        message.channel.send(
          `Sorry, there was a problem. ${owner} might be able to help!`
        );
      }
    }
  );
};
