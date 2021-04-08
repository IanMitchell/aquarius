import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Switch Code');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'switchcode',
  description: 'Nintendo Switch Friend Code lookup helper.',
  usage: '```@Aquarius switchcode```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^switchcode$/i, async (message) => {
    log.info(
      `Switch code request from ${chalk.green(message.author.username)}`,
      getMessageMeta(message)
    );

    try {
      const service = await aquarius.services.getLink(
        message.author,
        'Nintendo Switch'
      );

      if (!service) {
        message.channel.send(
          "It doesn't look like you've linked your Nintendo Switch code with me yet! Send me a DM saying `services add` to get started."
        );
      } else {
        message.channel.send(
          `${aquarius.emojiList.get('nintendoswitch')} | ${
            service.values['Friend Code']
          } _(${message.author})_`
        );
      }
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);
      message.channel.send('Sorry, I encountered a problem!');
    }

    analytics.trackUsage('switchcode', message);
  });
};
