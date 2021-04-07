import logdna from '@logdna/logger';
import debug from 'debug';

const logger = logdna.createLogger(process.env.LOGDNA_KEY, {
  app: 'aquarius',
  level: 'info',
});

/**
 * Description of the metadata allowed in log messages
 * @typedef {Object} LogMeta
 * @property {string} guildId - a Guild ID
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
 *
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
            // For dev and test environments, we want simple easy-to-read
            // logging, so we drop the level and meta information.
            if (process.env.NODE_ENV !== 'production') {
              log(argumentList[0]);
            } else {
              logger[property](...argumentList);
            }
          },
        });
      },
    }
  );
}

/**
 * Creates a Log Meta object from a message
 * @param {import('discord.js').Message} message - message associated with the log event
 * @returns {LogMeta} a consistent and formatted meta object for a messag event
 */
export function getMessageMeta(message) {
  return {
    guildId: message.guild.id,
  };
}
