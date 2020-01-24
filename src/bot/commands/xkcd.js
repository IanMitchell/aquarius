import debug from 'debug';
import dedent from 'dedent-js';
import { Permissions, RichEmbed } from 'discord.js';
import fetch from 'node-fetch';
import Sentry from '../../lib/analytics/sentry';

const log = debug('xkcd');

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
  const embed = new RichEmbed()
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
  aquarius.onCommand(/^xkcd$/i, async message => {
    log('Retrieving latest comic');

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

    aquarius.loading.start(message.channel);

    try {
      const postJson = await getLatestPostJson();
      const embed = createEmbedFromJson(postJson);

      message.channel.send(embed);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    aquarius.loading.stop(message.channel);

    analytics.trackUsage('latest', message);
  });

  aquarius.onCommand(/^xkcd random$/i, async message => {
    log('Retrieving random comic');

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

    aquarius.loading.start(message.channel);

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
        log('Random comic retrieval timed-out after 5 attempts.');
        message.channel.send('Sorry, there was a problem loading the comic.');
      } else {
        const embed = createEmbedFromJson(postJson);
        message.channel.send(embed);
      }
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    analytics.trackUsage('random', message);
    aquarius.loading.stop(message.channel);
  });

  aquarius.onCommand(/^xkcd (?<id>\d+)$/i, async (message, { groups }) => {
    log(`Retrieving comic ${groups.id}`);

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

    aquarius.loading.start(message.channel);

    try {
      const id = parseInt(groups.id, 10);

      const postJson = await getPostJsonById(id);
      const embed = createEmbedFromJson(postJson);

      message.channel.send(embed);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send('Sorry, there was a problem loading the comic.');
    }

    analytics.trackUsage('target', message);
    aquarius.loading.stop(message.channel);
  });
};
