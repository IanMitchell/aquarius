import { checkBotPermissions } from '@aquarius-bot/permissions';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import { getIconColor } from '../../core/helpers/colors';
import { humanize } from '../../core/helpers/lists';
import { capitalize } from '../../core/helpers/strings';

const log = debug('Slots');

export const info = {
  name: 'steam',
  description: 'Pulls information about Steam games',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius steam info <game>```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^steam info (?<game>.*)$/i,
    async (message, { groups }) => {
      log(`Looking up ${groups.game}`);

      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log('Invalid permissions');
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      const store = new URL('https://store.steampowered.com/api/storesearch');
      store.searchParams.append('cc', 'us');
      store.searchParams.append('l', 'en');
      store.searchParams.append('term', groups.game.replace(' ', '+'));

      const storeRequest = await fetch(store);
      const storeResponse = await storeRequest.json();

      if (!storeResponse?.total) {
        message.channel.send("Sorry, I didn't find any results for that!");
        return;
      }

      const [{ id }] = storeResponse.items;

      const details = new URL('https://store.steampowered.com/api/appdetails');
      details.searchParams.append('appids', id);

      const request = await fetch(details);
      const response = await request.json();
      const { data } = response[id.toString()];

      // Get Description
      let description = data.short_description;

      if (data.website) {
        description += ` [Learn More](${data.website}).`;
      }
      const color = await getIconColor(data.header_image);

      const embed = new MessageEmbed()
        .setAuthor(
          'Steam',
          'https://i.imgur.com/xxr2UBZ.png',
          'http://store.steampowered.com/'
        )
        .setTitle(data.name)
        .setColor(color)
        .setURL(`http://store.steampowered.com/app/${data.steam_appid}`)
        .setDescription(description)
        .setImage(data.header_image);

      // Get Price
      if (data.price_overview?.final > 0) {
        const current = (data.price_overview.final / 100).toLocaleString(
          'en-US',
          {
            style: 'currency',
            currency: data.price_overview.currency,
          }
        );

        const initial = (data.price_overview.initial / 100).toLocaleString(
          'en-US',
          {
            style: 'currency',
            currency: data.price_overview.currency,
          }
        );
        embed.addField(
          '💰 Price',
          current === initial ? current : `~~${initial}~~ ${current}`,
          true
        );
      }

      // Get Genres
      embed.addField(
        '📚 Genres',
        humanize(data.genres.map((genre) => genre.description)),
        true
      );

      // Get Metascore
      if (data.metacritic?.score) {
        embed.addField('👩‍⚖️ Metascore', data.metacritic.score, true);
      }

      // Get recommendations
      if (data.recommendations?.total) {
        embed.addField(
          '👍 Recommendations',
          new Intl.NumberFormat().format(data.recommendations.total),
          true
        );
      }

      if (data.categories?.length > 0) {
        const categories = data.categories
          .filter((category) => {
            return (
              category.description.toLowerCase() === 'single-player' ||
              category.description.toLowerCase() === 'multi-player'
            );
          })
          .map((category) => category.description);

        if (categories.length > 0) {
          embed.addField('🎮 Players', humanize(categories), true);
        }
      }

      // Get DLC
      if (data.dlc?.length > 0) {
        embed.addField('🔗 DLC Count', data.dlc.length, true);
      }

      // Get Release Date
      if (data.release_date?.date) {
        embed.addField('📅 Release Date', data.release_date.date, true);
      }

      // Get Platforms
      const platforms = Object.keys(data.platforms).map((value) =>
        capitalize(value)
      );
      if (platforms.length > 0) {
        embed.addField('💻 Platforms', humanize(platforms), true);
      }

      // Get Footer
      const developers = humanize(data.developers);
      const publishers = humanize(data.publishers);

      if (developers === publishers) {
        embed.setFooter(`Developed and published by ${developers}`);
      } else {
        embed.setFooter(
          `Developed by ${developers}. Published by ${publishers}`
        );
      }

      message.channel.send(embed);

      analytics.trackUsage('info', message);
    }
  );
};
