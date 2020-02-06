import Sentry from '@aquarius/sentry';
import debug from 'debug';

const log = debug('Same');

export const info = {
  name: 'same',
  description: 'After a number of repeated posts the bot will mimic it.',
};

const MESSAGE_STACK_SIZE = 4;
const messageStack = new Map();

function pushMessage(message, stackSize) {
  const { guild, channel } = message;

  if (!messageStack.get(guild.id)) {
    log(`Creating entry for ${guild.name}`);
    const channelMap = new Map();

    message.guild.channels
      .filter(chan => chan.type === 'text')
      .forEach(chan => channelMap.set(chan.id, []));

    messageStack.set(guild.id, channelMap);
  }

  if (!messageStack.get(guild.id).get(channel.id)) {
    messageStack.get(guild.id).set(channel.id, []);
  }

  messageStack
    .get(guild.id)
    .get(channel.id)
    .push(message.content);

  // Only track last couple messages
  if (messageStack.get(guild.id).get(channel.id).length > stackSize) {
    messageStack
      .get(guild.id)
      .get(channel.id)
      .shift();
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

  const getSize = guild => {
    let val = parseInt(settings.get(guild.id, 'size'), 10);

    if (Number.isNaN(val)) {
      val = MESSAGE_STACK_SIZE;
    }

    return Math.max(2, val);
  };

  // We want to track bot messages for this too, otherwise it looks weird
  aquarius.on('message', async message => {
    Sentry.configureMessageScope(message);

    if (message.content === '' || !message.guild) {
      return;
    }

    const size = getSize(message.guild);
    pushMessage(message, size);
  });

  aquarius.onMessage(info, async message => {
    if (message.content === '' || !message.guild) {
      return;
    }

    if (isSame(message, getSize(message.guild))) {
      log(
        `Sending '${message.content}' to ${message.guild.name}#${message.channel.name}`
      );
      messageStack.get(message.guild.id).set(message.channel.id, []);
      message.channel.send(message.content);

      analytics.trackUsage('same', message);
    }
  });
};
