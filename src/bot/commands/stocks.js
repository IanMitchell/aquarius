import debug from 'debug';
import dedent from 'dedent-js';
import { RichEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { getIconColor } from '../../lib/helpers/colors';

const log = debug('stocks');

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
  `,
};

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

async function getStockEmbed(profileData, historyData) {
  const today = historyData.historical[0];
  const imageColor = await getIconColor(profileData.profile.image);

  const changeIcon = `**${
    today.change >= 0
      ? ':chart_with_upwards_trend:'
      : ':chart_with_downwards_trend:'
  } Change**`;
  const changeValue =
    today.open < today.close ? today.change : -1 * today.change;

  const embed = new RichEmbed({
    title: `$${profileData.symbol} ${profileData.profile.changesPercentage}`,
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
      text: 'Data provided by Financial Modeling Prep',
    },
    fields: [
      {
        name: 'Price',
        value: getCurrencyString(profileData.profile.price),
      },
      {
        name: '**:bell: Open**',
        value: getCurrencyString(today.open),
        inline: true,
      },
      {
        name: '**:no_bell: Closing**',
        value: getCurrencyString(today.close),
        inline: true,
      },
      {
        name: changeIcon,
        value: getCurrencyString(changeValue, true),
        inline: true,
      },
      {
        name: '**:dollar: High**',
        value: getCurrencyString(today.high),
        inline: true,
      },
      {
        name: '**:fire: Low**',
        value: getCurrencyString(today.low),
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
        aquarius.loading.start(message.channel);

        const [profileData, historyData] = await Promise.all(
          [
            `https://financialmodelingprep.com/api/v3/company/profile/${groups.sign}/`,
            `https://financialmodelingprep.com/api/v3/historical-price-full/${groups.sign}?timeseries=5`,
          ].map(url => fetch(url).then(response => response.json()))
        );

        if (!profileData.symbol) {
          message.channel.send("I wasn't able to find that stock sign");
        } else {
          const embed = await getStockEmbed(profileData, historyData);
          message.channel.send(embed);
        }
      } catch (error) {
        log(error);
        message.channel.send(
          'Sorry, something went wrong! Please try again later'
        );
      }

      aquarius.loading.stop(message.channel);
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
        aquarius.loading.start(message.channel);

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

          Object.keys(data.ratingDetails).forEach(ratingName => {
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
        message.channel.send(
          'Sorry, something went wrong! Please try again later'
        );
      }

      aquarius.loading.stop(message.channel);
      analytics.trackUsage('rating', message);
    }
  );

  // aquarius.onCommand(
  //   /^stocks graph (day|week|month|year|all) symbol$/i
  //   //https://financialmodelingprep.com/api/v3/historical-price-full/AAPL?serietype=line
  // );

  aquarius.onCommand(/^stocks indexes$/, async message => {
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
      aquarius.loading.start(message.channel);

      const response = await fetch(
        'https://financialmodelingprep.com/api/v3/majors-indexes'
      );
      const data = await response.json();

      const embed = new RichEmbed({
        title: 'Major Stock Indexes',
      });

      data.majorIndexesList.forEach(index => {
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
      message.channel.send(
        'Sorry, something went wrong! Please try again later'
      );
    }

    aquarius.loading.stop(message.channel);
    analytics.trackUsage('indexes', message);
  });
};
