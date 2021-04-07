import logdna from '@logdna/logger';
import debug from 'debug';
import { once } from 'events';

const logger = logdna.createLogger(process.env.LOGDNA_KEY, {
  app: 'aquarius',
  level: 'info',
  indexMeta: true,
});

async function shutdown() {
  await once(logger, 'cleared');
}

function onSignal(signal) {
  logger.warn({ signal }, 'received signal, shutting down');
  shutdown();
}

process.on('SIGTERM', onSignal);
process.on('SIGINT', onSignal);

/**
 * @typedef { import('discord.js').Message } Message
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
 * @property {LogMessage} debug - Log a message with Debug level
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
                logger.log(message, {
                  app: name ?? 'aquarius',
                  level: property,
                  meta: metaArgs,
                });
              }
            } catch (error) {
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
 * @returns {LogMeta} a consistent and formatted meta object for a messag event
 */
export function getMessageMeta(message) {
  return {
    guildId: message?.guild?.id,
    channelId: message?.channel?.id,
    authorId: message?.author?.id,
    content: message?.cleanContent,
  };
}
