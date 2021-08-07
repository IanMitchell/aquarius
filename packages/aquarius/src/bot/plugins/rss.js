import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import dedent from 'dedent-js';
import Parser from 'rss-parser';
import { FIVE_MINUTES } from '../../core/helpers/times';
import getLogger from '../../core/logging/log';

const log = getLogger('RSS');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'rss',
  description:
    'Posts new RSS entries to a channel every five minutes. If the URL has not been posted in the past 50 channel messages, it is considered new.',
};

const FREQUENCY = FIVE_MINUTES;
const MESSAGE_LIMIT = 20;

const parser = new Parser({
  headers: {
    'Cache-Control': 'no-cache',
  },
});

// TODO: Maybe move into a lib function
async function checkForPastContent(channel, content, limit = MESSAGE_LIMIT) {
  try {
    const messages = await channel.messages.fetch({ limit });
    return Array.from(messages.values()).some((message) =>
      message.content.includes(content)
    );
  } catch (error) {
    log.error(error.message);
    Sentry.captureException(error);

    // Assume content exists
    return true;
  }
}

async function checkForUpdates(guild, url, name, analytics, errorName = null) {
  const channel = guild.channels.cache.find((c) => c.name === name);

  if (!url || !channel) {
    log.warn(
      `RSS command not properly configured in ${chalk.green(guild.name)}`
    );

    // TODO: Handle no channel better
    if (channel) {
      channel.send(
        `Hey ${guild.owner.user}! It looks like my RSS command isn't set up correctly. Please set a URL and channel name. DM me \`settings list rss\`!`
      );
    }

    return;
  }

  try {
    const feed = await parser.parseURL(url);

    feed.items.reverse().forEach(async (entry) => {
      const posted = await checkForPastContent(channel, entry.link);

      if (!posted) {
        log.info(
          `Posting ${chalk.blue(entry.title)} to ${chalk.green(guild.name)}`
        );
        channel.send(dedent`📰 **${entry.title}**

        ${entry.link}`);

        analytics.trackUsage('new entry', null, {
          title: entry.title,
          link: entry.link,
        });
      }
    });
  } catch (error) {
    log.error(error.message);
    Sentry.captureException(error);

    const errorChannel =
      guild.channels.cache.find((chan) => chan.name === errorName) ?? channel;

    const errorPosted = await checkForPastContent(
      errorChannel,
      'Could not parse this RSS feed',
      1
    );
    if (!errorPosted) {
      errorChannel.send(`Could not parse this RSS feed: ${url}`);
    }
  }
}

function onLoop(aquarius, settings, analytics, guild) {
  log.info(`Checking feed for ${chalk.green(guild.name)}`);
  const url = settings.get(guild.id, 'url');
  const name = settings.get(guild.id, 'channel');
  const errorName = settings.get(guild.id, 'errorChannel');
  checkForUpdates(guild, url, name, analytics, errorName);
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  settings.register('url', 'URL for the RSS Feed', null);
  settings.register('channel', 'Channel name to post in', null);
  settings.register('errorChannel', 'Channel name to post errors in', null);

  aquarius.loop(
    info,
    (guild) => onLoop(aquarius, settings, analytics, guild),
    FREQUENCY
  );
};
