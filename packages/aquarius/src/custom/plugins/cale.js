import Sentry from '@aquarius-bot/sentry';
import getLogger from '../../core/logging/log';

const log = getLogger('Cale');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'cale',
  hidden: true,
  description: 'GJ Cale!',
};

const COMPANY_INC = '91318657375825920';
const EMOJI = '857294811199569930';
const CALE = '103635479097769984';

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onMessage(info, (message) => {
    try {
      if (
        message?.guild?.id === COMPANY_INC &&
        message?.mentions?.members?.has(CALE)
      ) {
        log.info('pet');
        message.react(EMOJI);
        analytics.trackUsage('cale', message);
      }
    } catch (error) {
      log.error(error.message, { error });
      Sentry.captureException(error);
    }
  });
};
