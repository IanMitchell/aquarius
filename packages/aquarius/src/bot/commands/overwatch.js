import debug from 'debug';

const log = debug('Overwatch');

export const info = {
  name: 'overwatch',
  description: "Links to a user's Overwatch career overview page.",
  usage: '```@Aquarius overwatch [<region>] <account>```',
};

const URL = 'https://playoverwatch.com/en-us/career/pc';
const REGIONS = {
  US: 'us',
  EU: 'eu',
  KR: 'kr',
};

// TODO: Switch to account lookup
/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^overwatch (?:(?<region>[A-Za-z]{2}) )?(?<account>[\w]+#[\d]{4,5})$/i,
    (message, { groups }) => {
      let region = REGIONS.US;

      if (groups?.region?.toUpperCase() in REGIONS) {
        region = REGIONS[groups.region.toUpperCase()];
      }

      log(`Looking up ${groups.account} in ${region}`);

      message.channel.send(
        `${URL}/${region}/${groups.account.replace('#', '-')}`
      );

      analytics.trackUsage('link', message);
    }
  );
};
