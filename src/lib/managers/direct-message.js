import debug from 'debug';
import { FIVE_MINUTES } from '../helpers/times.js';

const log = debug('DirectMessageManager');

// TODO: Document
export default class DirectMessageManager {
  constructor() {
    this.defaultMaxResponseTime = FIVE_MINUTES;
    this.userQueue = new Map();
  }

  // TODO: Document
  async prompt(user, str) {
    let task;

    if (!this.userQueue.has(user.id)) {
      this.userQueue.set(user.id, Promise.resolve());
    }

    const promise = new Promise((resolve, reject) => {
      task = () => {
        log(`Prompting ${user.username}`);
        user.send(str);

        const collector = user.dmChannel.createMessageCollector(
          msg => !msg.author.bot,
          { time: this.defaultMaxResponseTime }
        );

        collector.on('collect', msg => {
          if (msg.cleanContent === 'stop') {
            log(`Stopping collector for ${user.username}`);
            return collector.stop('manual');
          }

          return collector.stop('input');
        });

        collector.on('end', (msgs, reason) => {
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
}
