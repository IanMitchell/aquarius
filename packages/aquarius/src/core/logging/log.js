import logdna from '@logdna/logger';
import debug from 'debug';
import { once } from 'events';

const logger = process.env.LOGDNA_KEY
  ? logdna.createLogger(process.env.LOGDNA_KEY, {
      app: 'aquarius',
      level: 'info',
      indexMeta: true,
    })
  : null;

if (process.env.NODE_ENV === 'production') {
  logger?.info('Creating connection to LogDNA');
}

async function shutdown() {
  if (logger) {
    await once(logger, 'cleared');
  } else {
    await Promise.resolve();
  }
}

function onSignal(signal) {
  logger?.warn({ signal }, 'received signal, shutting down');
  shutdown();
}

process.on('SIGTERM', onSignal);
process.on('SIGINT', onSignal);

/**
 * @typedef { import('discord.js').Message } Message
 * @typedef { import('discord.js').Presence } Presence
 */

/**
 * Description of the metadata allowed in log messages
 * @typedef {Object} LogMeta
 * @property {?string} guildId - a Guild ID
 * @property {?string} channelId - a Channel ID
 * @property {?string} authorId - an Author ID
 * @property {?string} content - content for the trigger message
 */

/**
 * Interface for the various levels of loggers
 * @callback LogMessage
 * @param {string} message - the message to send to the logger
 * @param {?LogMeta} meta - additional metadata to associate with the logged line
 */

/**
 * Description of a CommandParameter passed into Plugins and Commands
 * @typedef {Object} Logger
 * @property {LogMessage} info - Log a message with Info level
 * @property {LogMessage} warn - Log a message with Warn level
 * @property {LogMessage} debug - Log a message with Debug level
 * @property {LogMessage} error - Log a message with Error level
 * @property {LogMessage} fatal - Log a message with Fatal level
 * @property {LogMessage} trace - Log a message with Trace level
 */

/**
 * Creates a logger instance
 * @param {string} name - name for the area of code (usually the command name)
 * @returns {Logger} a logger instance
 */
export default function getLogger(name) {
  const log = debug(name);

  // I do the dumbest shit lol
  return new Proxy(
    {},
    {
      // eslint-disable-next-line no-unused-vars
      get: (logTarget, property, receiver) => {
        return new Proxy(() => {}, {
          apply: (fnTarget, thisArg, argumentList) => {
            try {
              const [message, metaArgs] = argumentList;
              // For dev and test environments, we want simple easy-to-read
              // logging, so we drop the level and meta information.
              if (process.env.NODE_ENV !== 'production') {
                log(message);
              } else {
                logger?.log(message, {
                  app: name ?? 'aquarius',
                  level: property,
                  meta: metaArgs,
                });
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error);
            }
          },
        });
      },
    }
  );
}

/**
 * Creates a Log Meta object from a message
 * @param {Message} message - message associated with the log event
 * @returns {LogMeta} a consistent and formatted meta object for a message event
 */
export function getMessageMeta(message) {
  return {
    guild: {
      id: message?.guild?.id,
      name: message?.guild?.name,
    },
    channel: {
      id: message?.channel?.id,
      name: message?.channel?.name,
    },
    author: {
      id: message?.author?.id,
      name: message?.author?.username,
    },
    content: message?.cleanContent,
  };
}

/**
 * Creates a Log Meta object from a presence
 * @param {Presence} presence - presence associated with the log event
 * @returns {LogMeta} a consistent and formatted meta object for a message event
 */
export function getPresenceMeta(presence) {
  return {
    guild: {
      id: presence.guild.id,
      name: presence.guild.name,
    },
    user: {
      id: presence.user.id,
      name: presence.user.username,
    },
  };
}

/**
 * Creates a Log Meta object from an interaction
 * @param {Interaction} interaction - interaction associated with the log event
 * @returns {LogMeta} a consistent and formatted meta object for a message event
 */
export function getInteractionMeta(interaction) {
  return {
    guild: {
      id: interaction?.guildID,
      name: interaction?.guild?.name,
    },
    channel: {
      id: interaction?.channelID,
      name: interaction?.channel?.name,
    },
    author: {
      id: interaction?.user?.id,
      name: interaction?.user?.username,
    },
    options: interaction?.options?.map((option) => ({
      name: option.name,
      value: option.value,
    })),
  };
}
