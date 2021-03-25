import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';

const log = debug('Host');

async function initialize() {
  try {
    log('Loading Bot');
    await import('./src/aquarius.js');

    log('Starting Server');
    await import('./web/server.js');
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }
}

initialize();
