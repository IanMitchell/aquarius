import debug from 'debug';
import timber from 'timber';
import Sentry from './src/lib/errors/sentry';

const log = debug('Host');

async function initialize() {
  try {
    log('Loading Bot');
    await import('./src');

    log('Starting Server');
    await import('./web');
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }
}

if (process.env.TIMBER_KEY && process.env.NODE_ENV !== 'development') {
  const transport = new timber.transports.HTTPS(process.env.TIMBER_KEY);
  timber.install(transport);
  log('Timber Activated');
}

initialize();
