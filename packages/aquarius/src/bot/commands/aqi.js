import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import { getEmbedColorFromHex } from '../../core/helpers/colors';
import { ONE_HOUR } from '../../core/helpers/times';

const log = debug('AQI');

export const info = {
  name: 'aqi',
  description:
    'Displays the current PM2.5 Air Quality Index (AQI) for selected USA locations.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius aqi <location>```',
};

// Defined here:
// https://docs.airnowapi.org/aq101
function getColorCode(aqi) {
  if (aqi <= 50) {
    return getEmbedColorFromHex('#00e400');
  }

  if (aqi <= 100) {
    return getEmbedColorFromHex('#ffff00');
  }

  if (aqi <= 150) {
    return getEmbedColorFromHex('#ff7e00');
  }

  if (aqi <= 200) {
    return getEmbedColorFromHex('#ff0000');
  }

  if (aqi <= 300) {
    return getEmbedColorFromHex('#8f3f97');
  }

  return getEmbedColorFromHex('#7e0023');
}

async function getLatitudeAndLongitude(searchTerm) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchTerm
    )}.json?access_token=${process.env.MAPBOX_API_KEY}`
  );
  const data = await response.json();

  return {
    name: data.features[0].place_name,
    coordinates: data.features[0].center,
  };
}

async function getForecast(longitude, latitude) {
  const response = await fetch(
    `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${process.env.IQAIR_API_KEY}`
  );
  return response.json();
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  const cache = new NodeCache({
    stdTTL: ONE_HOUR,
  });

  aquarius.onCommand(
    /^(?:aqi) (?<location>.*)/i,
    async (message, { groups }) => {
      try {
        let data = cache.get(groups.location);

        if (!data) {
          log(`Querying for ${groups.location}`);
          const { coordinates } = await getLatitudeAndLongitude(
            groups.location
          );
          const forecast = await getForecast(...coordinates);

          if (forecast?.status !== 'success') {
            log(`Unable to find information for ${groups.location}`);
            message.channel.send(
              "Sorry, I wasn't able to find information about that location."
            );
            return;
          }

          cache.set(groups.location, forecast.data);
          data = forecast.data;
        }

        const embed = new MessageEmbed()
          .setTitle(
            `PM2.5 Air Quality Index for ${data.city}, ${data.state} ${data.country}`
          )
          .setDescription(
            `The current AQI is **${data.current.pollution.aqius}**`
          )
          .setColor(getColorCode(data.current.pollution.aqius))
          .setFooter(
            'Information from IQ Air',
            'https://www.iqair.com/assets/favicons/favicon-32x32.png'
          );

        message.channel.send(embed);
      } catch (error) {
        log(error);
        Sentry.captureException(error);
        message.channel.send("Sorry, I wasn't able to get the air quality.");
      }

      analytics.trackUsage('aqi', message);
    }
  );
};
