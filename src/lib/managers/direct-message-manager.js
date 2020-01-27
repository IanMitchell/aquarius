import debug from 'debug';
import { FIVE_MINUTES } from '../helpers/times';

const log = debug('DirectMessageManager');

/**
 * @typedef {import('discord.js').User} User
 */

const STATUS = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
};

/**
 * Manages Direct Message commands to a user via a queue
 */
export default class DirectMessageManager {
  constructor() {
    this.defaultMaxResponseTime = FIVE_MINUTES;
    this.userQueue = new Map();
    this.status = new Map();
  }

  /**
   * Queues a prompt to Direct Message to a user. If other messages have been queued, they will happen first. Once a user responds the promise will resolve with their input. If the prompt times out or the user cancels the promise will reject with the collector end event reason (see Discord.js)
   * @param {import('discord.js').User} user - User to message
   * @param {string} str - Prompt
   * @returns {Promise<string>} Promise that resolves with user input once a user responds or rejects with the collector end event reason
   */
  async prompt(user, str) {
    let task;

    if (!this.userQueue.has(user.id)) {
      this.userQueue.set(user.id, Promise.resolve());
    }

    const promise = new Promise((resolve, reject) => {
      this.status.set(user.id, STATUS.PENDING);

      task = () => {
        log(`Prompting ${user.username}`);
        user.send(str);

        const collector = user.dmChannel.createMessageCollector(
          msg => !msg.author.bot,
          { time: this.defaultMaxResponseTime }
        );

        collector.on('collect', msg => {
          if (msg.cleanContent.toLowerCase() === 'stop') {
            log(`Stopping collector for ${user.username}`);
            return collector.stop('manual');
          }

          return collector.stop('input');
        });

        collector.on('end', (msgs, reason) => {
          this.status.set(user.id, STATUS.FULFILLED);

          if (reason === 'manual' || reason === 'time') {
            log(`Rejecting for ${user.username} due to ${reason}`);
            reject(reason);
          }

          log(`Returning input for ${user.username}`);
          resolve(msgs.first());
        });
      };
    });

    this.userQueue
      .get(user.id)
      .then(task)
      .catch(task);
    this.userQueue.set(user.id, promise);
    return promise;
  }

  /**
   * Check to see if a user has an active prompt
   * @param {User} user - The User to check the status of
   * @returns {boolean} Whether there is an active prompt or not
   */
  isActive(user) {
    if (this.status.has(user.id)) {
      return this.status.get(user.id) === STATUS.PENDING;
    }

    return false;
  }
}
