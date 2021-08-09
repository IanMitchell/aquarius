import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import { getInputAsNumber } from '../../core/helpers/input';
import getLogger from '../../core/logging/log';

const log = getLogger('Same');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'same',
  description: 'After a number of repeated posts the bot will mimic it.',
};

const MESSAGE_STACK_SIZE = 4;
const messageStack = new Map();

function pushMessage(message, stackSize) {
  const { guild, channel } = message;

  if (!messageStack.get(guild.id)) {
    log.info(`Creating entry for ${chalk.green(guild.name)}`);
    const channelMap = new Map();

    message.guild.channels.cache
      .filter((chan) => chan.type === 'text')
      .forEach((chan) => channelMap.set(chan.id, []));

    messageStack.set(guild.id, channelMap);
  }

  if (!messageStack.get(guild.id).get(channel.id)) {
    messageStack.get(guild.id).set(channel.id, []);
  }

  messageStack.get(guild.id).get(channel.id).push(message.content);

  // Only track last couple messages
  if (messageStack.get(guild.id).get(channel.id).length > stackSize) {
    messageStack.get(guild.id).get(channel.id).shift();
  }
}

function isSame(message, stackSize) {
  const { guild, channel } = message;

  if (!messageStack.get(guild.id).get(channel.id)) {
    return false;
  }

  if (messageStack.get(guild.id).get(channel.id).length !== stackSize) {
    return false;
  }

  const messageSet = new Set(messageStack.get(guild.id).get(channel.id));

  if (messageSet.size === 1 && messageSet.has(message.content)) {
    return true;
  }

  return false;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, settings, analytics }) => {
  // Default repeat message trigger length
  settings.register(
    'size',
    'Amount of messages to trigger on',
    MESSAGE_STACK_SIZE
  );

  const getSize = (guild) => {
    const value =
      getInputAsNumber(settings.get(guild.id, 'size')) ?? MESSAGE_STACK_SIZE;
    return Math.max(2, value);
  };

  // We want to track bot messages for this too, otherwise it looks weird
  aquarius.on('messageCreate', (message) => {
    Sentry.withMessageScope(message, () => {
      if (
        message.content === '' ||
        !message.guild ||
        message.author.id === aquarius.user.id
      ) {
        return;
      }

      const size = getSize(message.guild);
      pushMessage(message, size);
    });
  });

  aquarius.onMessage(info, (message) => {
    if (message.content === '' || !message.guild) {
      return;
    }

    if (isSame(message, getSize(message.guild))) {
      log.info(
        `Sending '${chalk.blue(message.content)}' to ${chalk.green(
          message.guild.name
        )}#${chalk.green(message.channel.name)}`
      );
      messageStack.get(message.guild.id).set(message.channel.id, []);
      message.channel.send(message.content);

      analytics.trackUsage('same', message);
    }
  });
};
