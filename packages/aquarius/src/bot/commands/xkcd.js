import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { getInputAsNumber } from '../../core/helpers/input';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('xkcd');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'xkcd',
  description: 'View an xkcd comic.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **View Random Comic**
    \`\`\`@Aquarius xkcd\`\`\`

    **View Latest Comic**
    \`\`\`@Aquarius xkcd latest\`\`\`

    **View Specific Comic**
    \`\`\`@Aquarius xkcd <id>\`\`\`
  `,
};

function createEmbedFromJson(postJson) {
  const embed = new MessageEmbed()
    .setTitle(postJson.safe_title)
    .setColor(0x96a8c8)
    .setFooter(postJson.alt)
    .setImage(postJson.img);
  return embed;
}

async function getLatestPostJson() {
  const response = await fetch('https://xkcd.com/info.0.json');
  const json = await response.json();
  return json;
}

async function getPostJsonById(id) {
  const response = await fetch(`https://xkcd.com/${id}/info.0.json`);
  const json = await response.json();
  return json;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^xkcd$/i, async (message) => {
    log.info('Retrieving latest comic', getMessageMeta(message));

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions', getMessageMeta(message));
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      const postJson = await getLatestPostJson();
      const embed = createEmbedFromJson(postJson);

      message.channel.send(embed);
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    analytics.trackUsage('latest', message);
  });

  aquarius.onCommand(/^xkcd random$/i, async (message) => {
    log.info('Retrieving random comic', getMessageMeta(message));

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions', getMessageMeta(message));
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      const latestPostJson = await getLatestPostJson();
      const max = latestPostJson.num;

      let postJson = {};
      let countAttempts = 0;
      do {
        const id = Math.floor(Math.random() * max);
        try {
          // eslint-disable-next-line no-await-in-loop
          postJson = await getPostJsonById(id);
        } catch (err) {
          postJson = null;
        }
        countAttempts += 1;
      } while (postJson === null && countAttempts < 5);

      if (postJson === null) {
        log.error(
          'Random comic retrieval timed-out after 5 attempts.',
          getMessageMeta(message)
        );
        message.channel.send('Sorry, there was a problem loading the comic.');
      } else {
        const embed = createEmbedFromJson(postJson);
        message.channel.send(embed);
      }
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    analytics.trackUsage('random', message);
  });

  aquarius.onCommand(/^xkcd (?<id>\d+)$/i, async (message, { groups }) => {
    log.info(`Retrieving comic ${chalk.blue(groups.id)}`);

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions', getMessageMeta(message));
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      const id = getInputAsNumber(groups.id);

      if (!id) {
        message.channel.send("That doesn't look like a valid id!");
      } else {
        const postJson = await getPostJsonById(id);
        const embed = createEmbedFromJson(postJson);

        message.channel.send(embed);
      }
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    analytics.trackUsage('target', message);
  });
};
