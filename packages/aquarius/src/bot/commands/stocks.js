import { startLoading, stopLoading } from '@aquarius/loading';
import Sentry from '@aquarius/sentry';
import alphaVantageAPI from 'alphavantage';
import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import Discord from 'discord.js';
import fetch from 'node-fetch';
import { getIconColor } from '../../core/helpers/colors';

// CJS / ESM compatibility
const { parse } = dateFns;
const { Permissions, RichEmbed } = Discord;

const log = debug('Stocks');

export const info = {
  name: 'stocks',
  description: 'Retrieve recent information about the stock market',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **Lookup Stock Symbol**
    \`\`\`@Aquarius stocks info <symbol>\`\`\`

    **Lookup Stock Rating**
    \`\`\`@Aquarius stocks rating <symbol>\`\`\`

    **Get Stock Index Performance**
    \`\`\`@Aquarius stocks indexes\`\`\`

    **Get Sector Performance**
    \`\`\`@Aquarius stocks sectors [(1d|5d|1m|3m|ytd|1y|3y|5y|10y)]\`\`\`
    Without a time duration, Aquarius will default to looking at the current day.
  `,
};

const ALPHA_VANTAGE = alphaVantageAPI({ key: process.env.ALPHA_VANTAGE_KEY });

function normalize(data) {
  return ALPHA_VANTAGE.util.polish(data);
}

function getKeyFromDuration(time) {
  switch (time) {
    case '1d':
      return '1day';
    case '5d':
      return '5day';
    case '1m':
      return '1month';
    case '3m':
      return '3month';
    case 'ytd':
      return 'ytd';
    case '1y':
      return '1year';
    case '3y':
      return '3year';
    case '5y':
      return '5year';
    case '10y':
      return '10year';
    case 'now':
    default:
      return 'real';
  }
}

function getCurrencyString(value, signed = false) {
  const amount = parseFloat(value);

  if (amount) {
    const str = amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    if (signed && !str.startsWith('-')) {
      return `+${str}`;
    }

    return str;
  }

  return '---';
}

async function getStockEmbed(profileData, priceData) {
  const imageColor = await getIconColor(profileData.profile.image);

  const changeIcon = `**${
    priceData.change >= 0
      ? ':chart_with_upwards_trend:'
      : ':chart_with_downwards_trend:'
  } Change**`;

  const embed = new RichEmbed({
    title: profileData.symbol,
    description: profileData.profile.description,
    thumbnail: {
      url: profileData.profile.image,
    },
    author: {
      name: profileData.profile.companyName,
      url: profileData.profile.website,
    },
    color: imageColor,
    footer: {
      text: 'Data provided by Financial Modeling Prep and Alpha Vantage',
    },
    fields: [
      {
        name: '**:dollar: Price**',
        value: getCurrencyString(priceData.price),
        inline: true,
      },
      {
        name: changeIcon,
        value: `${getCurrencyString(priceData.change, true)} (${
          priceData.change_percent
        })`,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
      },
      {
        name: '**:bell: Open**',
        value: getCurrencyString(priceData.open),
        inline: true,
      },
      {
        name: '**:dollar: High**',
        value: getCurrencyString(priceData.high),
        inline: true,
      },
      {
        name: '**:fire: Low**',
        value: getCurrencyString(priceData.low),
        inline: true,
      },
      {
        name: '**:moneybag: Market Cap**',
        value: getCurrencyString(profileData.profile.mktCap),
        inline: true,
      },
    ],
  });

  return embed;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^stocks info \$?(?<sign>.+)$/i,
    async (message, { groups }) => {
      log(`Looking up ${groups.sign}`);

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
        startLoading(message.channel);

        const [profileDataResponse, priceData] = await Promise.all([
          fetch(
            `https://financialmodelingprep.com/api/v3/company/profile/${groups.sign}/`
          ),
          ALPHA_VANTAGE.data.quote(groups.sign),
        ]);

        const profileData = await profileDataResponse.json();

        if (!profileData.symbol) {
          message.channel.send("I wasn't able to find that stock sign");
        } else {
          const embed = await getStockEmbed(
            profileData,
            normalize(priceData).data
          );
          message.channel.send(embed);
        }
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        message.channel.send(
          'Sorry, something went wrong! Please try again later'
        );
      }

      stopLoading(message.channel);
      analytics.trackUsage('info', message);
    }
  );

  aquarius.onCommand(
    /^stocks rating \$?(?<sign>.+)$/i,
    async (message, { groups }) => {
      log(`Looking up rating for ${groups.sign}`);

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
        startLoading(message.channel);

        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/company/rating/${groups.sign}`
        );
        const data = await response.json();

        if (!data.symbol) {
          message.channel.send(
            "I wasn't able to find data for that stock sign"
          );
        } else {
          const embed = new RichEmbed({
            title: `$${data.symbol} Rating: ${data.rating.recommendation}`,
          });

          Object.keys(data.ratingDetails).forEach((ratingName) => {
            const rating = data.ratingDetails[ratingName];

            embed.addField(
              `**${ratingName}**`,
              `${rating.recommendation} (${rating.score})`,
              true
            );
          });

          if (data.rating.score > 3) {
            embed.setColor(0x00ff00);
          } else if (data.rating.score < 3) {
            embed.setColor(0xff0000);
          }

          message.channel.send(embed);
        }
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        message.channel.send(
          'Sorry, something went wrong! Please try again later'
        );
      }

      stopLoading(message.channel);
      analytics.trackUsage('rating', message);
    }
  );

  // aquarius.onCommand(
  //   /^stocks graph (day|week|month|year|all) symbol$/i
  //   //https://financialmodelingprep.com/api/v3/historical-price-full/AAPL?serietype=line
  // );

  aquarius.onCommand(/^stocks indexes$/, async (message) => {
    log('Looking up indexes');

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
      startLoading(message.channel);

      const response = await fetch(
        'https://financialmodelingprep.com/api/v3/majors-indexes'
      );
      const data = await response.json();

      const embed = new RichEmbed({
        title: 'Major Stock Indexes',
        footer: {
          text: 'Data provided by Financial Modeling Prep',
        },
      });

      data.majorIndexesList.forEach((index) => {
        embed.addField(
          `**${index.indexName}**`,
          `${getCurrencyString(index.price)} (${getCurrencyString(
            index.changes,
            true
          )})`,
          true
        );
      });

      message.channel.send(embed);
    } catch (error) {
      log(error);
      Sentry.captureException(error);

      message.channel.send(
        'Sorry, something went wrong! Please try again later'
      );
    }

    stopLoading(message.channel);
    analytics.trackUsage('indexes', message);
  });

  aquarius.onCommand(
    /^stocks sectors(?: (?<time>1d|5d|1m|3m|ytd|1y|3y|5y|10y))?$/i,
    async (message, { groups }) => {
      const time = getKeyFromDuration(groups.time);

      log(`Looking up sectors for ${time}`);

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
        startLoading(message.channel);

        const data = normalize(await ALPHA_VANTAGE.performance.sector());

        const embed = new RichEmbed({
          title: `${data.meta.information} (${time} view)`,
          timestamp: parse(
            data.meta.updated.replace(/ET /, ''),
            'p P',
            new Date()
          ),
          footer: {
            text: 'Data provided by Alpha Vantage',
          },
        });

        Object.keys(data[time]).forEach((sector) => {
          embed.addField(`**${sector}**`, data[time][sector], true);
        });

        message.channel.send(embed);
      } catch (error) {
        log(error);
        Sentry.captureException(error);

        message.channel.send(
          'Sorry, something went wrong! Please try again later'
        );
      }

      stopLoading(message.channel);
      analytics.trackUsage('sectors', message);
    }
  );
};
