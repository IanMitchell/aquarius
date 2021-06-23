import getLogger from '../../core/logging/log';

const log = getLogger('cale');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'cale',
  hidden: true,
  description: 'GJ Cale!',
};

const COMPANY_INC = '91318657375825920';
const EMOJI = '857294888462319637';
const CALE = '103635479097769984';

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  aquarius.onMessage(info, (message) => {
    if (
      message?.guild?.id === COMPANY_INC &&
      message?.mentions?.members?.has(CALE)
    ) {
      log('pet');
      message.react(EMOJI);
    }
  });
};
