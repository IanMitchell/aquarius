import debug from 'debug';
import { RichEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { fromUnixTime, format } from 'date-fns';

const log = debug('stocks');

// TODO: Write Info
export const info = {
  name: 'stocks',
  description: 'Get some handy dandy stock info for your day trading!',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius stocks <stock symbol>```',
};
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const API = 'https://cloud.iexapis.com/stable/stock/';

const TOKEN = `quote?token=${process.env.IEXCLOUD_KEY}`;

function createStocksEmbed(data) {
  const change = `Change ${
    data.change >= 0
      ? ':chart_with_upwards_trend:'
      : ':chart_with_downwards_trend:'
  }`;
  const embed = new RichEmbed({
    description: `*Stock Symbol: $${data.symbol}*`,
    color: 16318579,
    timestamp: `${fromUnixTime(data.latestUpdate / 1000)}`,
    footer: {
      text: 'Data provided by IEX Cloud',
    },
    author: {
      name: `${data.companyName} (Click here for more info!)`,
      url: `https://finance.yahoo.com/quote/${data.symbol}/`,
    },
    fields: [
      {
        name: 'Open :bell:',
        value: `${data.open}`,
        inline: true,
      },
      {
        name: 'Closing :no_bell:',
        value: `${data.close}`,
        inline: true,
      },
      {
        name: 'High :dollar:',
        value: `${data.high}`,
        inline: true,
      },
      {
        name: 'Low :fire:',
        value: `${data.low}`,
        inline: true,
      },
      {
        name: `${change}`,
        value: `${data.change}`,
        inline: true,
      },
      {
        name: '52 Week High  :money_with_wings:',
        value: `${data.week52High}`,
        inline: true,
      },
      {
        name: '52 Week Low :scream:',
        value: `${data.week52Low}`,
        inline: true,
      },
      {
        name: 'Market Cap :moneybag:',
<<<<<<< HEAD
        value: `$${data.marketCap.toLocaleString()}`,
=======
        value: `$${numberWithCommas(data.marketCap)}`,
>>>>>>> 6c7c0f56db1965a20bdff7fc454b184a98446208
        inline: true,
      },
    ],
  });
  return embed;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^stocks (?<sign>.+)$/i, async (message, { groups }) => {
    const check = aquarius.permissions.check(
      message.guild,
      ...info.permissions
    );

    if (!check.valid) {
      log('Invalid permissions');
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      aquarius.loading.start(message.channel);
      const response = await fetch(`${API}/${groups.sign}/${TOKEN}`);
      const data = await response.json();
      const embed = await createStocksEmbed(data);
      message.channel.send(embed);
      aquarius.loading.stop(message.channel);
    } catch (error) {
      log(error);
      message.channel.send(
        'Sorry, something went wrong! (Maybe you mistyped the symbol?)'
      );
      aquarius.loading.stop(message.channel);
    }
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

    analytics.trackUsage('stocks', message);
  });
};
