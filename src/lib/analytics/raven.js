import Raven from 'raven';

export default Raven.config(process.env.SENTRY).install();
