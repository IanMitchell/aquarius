import * as Sentry from '@sentry/node';

export default (() => {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.init({ dsn: process.env.SENTRY });
  }

  return {
    captureException: () => {},
  };
})();
