import { RichEmbed } from 'discord.js';

// TODO: Write Info
export const info = {
  name: 'stocks',
  description: '',
  usage: '',
  disabled: true,
};

async function getStock(sign) {
  return Promise.resolve(sign);
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^stocks(?: (?<duration>(?:1d|1w|1m|3m|6m|1y|2y|5y|10y)))? (?<sign>.+)$/i,
    async (message, { groups }) => {
      const data = await getStock(groups.sign);

      /**
       * Chart
       * Open
       * High
       * Low
       * Vol
       * P/E
       * Market Cap
       * 52w High
       * 52w Low
       * Avg Vol
       * Yield
       * Beta
       * EPS
       */

      const embed = new RichEmbed().setURL(data.url);

      message.channel.send(embed);
      analytics.trackUsage('stocks', message);
    }
  );
};
