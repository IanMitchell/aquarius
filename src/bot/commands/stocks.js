import debug from 'debug';
import { RichEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';

const log = debug('stocks');

// TODO: Write Info
export const info = {
  name: 'stocks',
  description: '',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '',
};

const API = 'https://cloud.iexapis.com/stable/stock/';

const TOKEN = `quote?token=${process.env.IEXCLOUD_KEY}`;

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
      const response = await fetch(`${API}/${groups.sign}/${TOKEN}`);
      const data = await response.json();
      message.channel.send(data);
    } catch (error) {
      log(error);
      message.channel.send(
        'Sorry, something went wrong! (Maybe you mistyped the symbol?'
      );
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
