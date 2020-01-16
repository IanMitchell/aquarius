import * as Sentry from '@sentry/node';

export default (() => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({ dsn: process.env.SENTRY });
  }

  return Sentry;
})();
