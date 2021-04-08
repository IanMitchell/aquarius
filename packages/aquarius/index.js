import Sentry from '@aquarius-bot/sentry';
import getLogger from './src/core/logging/log';

const log = getLogger('Host');

async function initialize() {
  try {
    log.info('Loading Bot');
    await import('./src/aquarius.js');

    log.info('Starting Server');
    await import('./web/server.js');
  } catch (error) {
    log.fatal(error.message, { error });
    Sentry.captureException(error);
  }
}

initialize();
