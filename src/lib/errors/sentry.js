import Sentry from '@sentry/node';

export default (() => Sentry.init({ dsn: process.env.SENTRY }))();
