import 'now-env';
import debug from 'debug';
import Raven from 'raven';
import timber from 'timber';
import createCollections from './src/lib/database/setup';

const log = debug('Host');

async function initialize() {
  log('Initializing Database');
  await createCollections();

  log('Loading Bot');
  await import('./src');

  log('Starting Server');
  await import('./web');
}

if (process.env.TIMBER_KEY && process.env.NODE_ENV !== 'development') {
  const transport = new timber.transports.HTTPS(process.env.TIMBER_KEY);
  timber.install(transport);
  log('Timber Activated');
}

if (process.env.SENTRY) {
  Raven.config(process.env.SENTRY).install();
  log('Sentry Activated');

  Raven.context(initialize);
} else {
  initialize();
}
