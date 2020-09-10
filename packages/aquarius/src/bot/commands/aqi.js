import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import { getEmbedColorFromHex } from '../../core/helpers/colors';
import { getStandardDate } from '../../core/helpers/dates';
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
const COLORS = {
  '1': getEmbedColorFromHex('#00e400'),
  '2': getEmbedColorFromHex('#ffff00'),
  '3': getEmbedColorFromHex('#ff7e00'),
  '4': getEmbedColorFromHex('#ff0000'),
  '5': getEmbedColorFromHex('#8f3f97'),
  '6': getEmbedColorFromHex('#7e0023'),
};

async function getLatitudeAndLongitude(searchTerm) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchTerm
    )}.json?access_token=${process.env.MAPBOX_API_KEY}&country=US`
  );
  const data = await response.json();

  return {
    name: data.features[0].place_name,
    coordinates: data.features[0].center,
  };
}

async function getForecast(longitude, latitude) {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate()}`;

  const response = await fetch(
    `http://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${latitude}&longitude=${longitude}&date=${dateStr}&distance=25&API_KEY=${process.env.AIR_NOW_API_KEY}`
  );
  const data = await response.json();

  return data.filter((entry) => entry.ParameterName === 'PM2.5');
}

function formatAQI(day) {
  const { ActionDay, AQI, Category } = day;

  let str = '';

  if (ActionDay) {
    str += '⚠️ ';
  }

  if (AQI && AQI !== -1) {
    str += `${AQI}: `;
  }

  str += Category?.Name;

  return str;
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

          if (!forecast || forecast.length === 0) {
            log(`Unable to find information for ${groups.location}`);
            message.channel.send(
              "Sorry, I wasn't able to find information about that location. This command is currently limited to certain locations within the United States."
            );
            return;
          }

          cache.set(groups.location, forecast);
          data = forecast;
        }

        const [today, ...futureDays] = data;

        const embed = new MessageEmbed()
          .setTitle(
            `PM2.5 Air Quality Index for ${today?.ReportingArea}, ${today?.StateCode}`
          )
          .setDescription(`The current AQI is **${formatAQI(today)}**`)
          .setColor(COLORS[today?.Category?.Number])
          .setFooter('Information from AirNow');

        futureDays.forEach((day) =>
          embed.addField(
            getStandardDate(new Date(day?.DateForecast)),
            formatAQI(day)
          )
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
