import chalk from 'chalk';
import dateFns from 'date-fns';
import debug from 'debug';
import dedent from 'dedent-js';
import Discord from 'discord.js';
import fetch from 'node-fetch';

// CJS / ESM compatibility
const { format } = dateFns;
const { Permissions, RichEmbed } = Discord;

const log = debug('Weather');

// TODO: Support Celcius
// https://darksky.net/dev/docs#forecast-request
export const info = {
  name: 'weather',
  description: 'View weekly weather forecast.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius weather <search term>```',
};

// TODO: Implement icons
function getIcon(type) {
  switch (type) {
    case 'partly-cloudy-night':
      return '';
    case 'clear-day':
      return '';
    case 'clear-night':
      return '';
    case 'rain':
      return '';
    case 'snow':
      return '';
    case 'sleet':
      return '';
    case 'wind':
      return '';
    case 'fog':
      return '';
    case 'cloudy':
      return '';
    case 'partly-cloudy-day':
      return '';
    default:
      log(`${chalk.bold.red('ERROR:')} Unknown Weather Type '${type}'`);
      return null;
  }
}

function getEmojiIcon(type) {
  switch (type) {
    case 'partly-cloudy-night': // See: https://darksky.net/dev/docs/faq#icon-selection
    case 'clear-day':
      return ':sunny:';
    case 'clear-night':
      return ':crescent_moon:';
    case 'rain':
      return ':cloud_rain:';
    case 'snow':
    case 'sleet':
      return ':cloud_snow:';
    case 'wind':
      return ':dash:';
    case 'fog':
      return ':foggy:';
    case 'cloudy':
      return ':cloud:';
    case 'partly-cloudy-day':
      return ':white_sun_cloud:';
    default:
      log(`${chalk.bold.red('ERROR:')} Unknown Weather Type '${type}'`);
      return ':question:';
  }
}

function getCelsius(fahrenheit) {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

function formatTemperature(value, type = 'F') {
  return `${Math.round(value)}°${type}`;
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

async function getDarkSkyForecast(longitude, latitude) {
  const response = await fetch(
    `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${latitude},${longitude}`
  );
  return response.json();
}

function getWeatherEmbed(location, data) {
  const embed = new RichEmbed({
    title: `Weather Forecast for ${location}`,
    description: dedent`
      ${data.daily.data[0].summary} Currently ${formatTemperature(
      data.currently.temperature
    )} (${formatTemperature(
      getCelsius(data.currently.temperature),
      'C'
    )}) with a high of ${formatTemperature(
      data.daily.data[0].temperatureHigh
    )} (${formatTemperature(
      getCelsius(data.daily.data[0].temperatureHigh),
      'C'
    )}) and a low of ${formatTemperature(
      data.daily.data[0].temperatureLow
    )} (${formatTemperature(
      getCelsius(data.daily.data[0].temperatureLow),
      'C'
    )}).

      There is a ${Math.round(
        100 * data.daily.data[0].precipProbability
      )}% chance of rain today.
    `,
    color: 0x7fdbff,
    footer: {
      icon_url: 'https://darksky.net/images/darkskylogo.png',
      text: 'Powered by Dark Sky and Mapbox',
    },
    thumbnail: {
      url: getIcon(data.daily.data[0].icon),
    },
  });

  // Remove current day and the 8th day
  data.daily.data
    .slice(1)
    .slice(0, -1)
    .forEach((day) => {
      let str = `High: ${formatTemperature(
        day.temperatureHigh
      )} (${formatTemperature(getCelsius(day.temperatureHigh), 'C')})
      Low: ${formatTemperature(day.temperatureLow)} (${formatTemperature(
        getCelsius(day.temperatureLow),
        'C'
      )})`;

      if (day.precipProbability > 0.1) {
        str += `\n:sweat_drops: ${Math.round(100 * day.precipProbability)}%`;
      }

      embed.addField(
        `${getEmojiIcon(day.icon)} ${format(
          new Date(day.time * 1000),
          'EEEE'
        )}`,
        str,
        true
      );
    });

  return embed;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^(?:w|weather) (?<input>.*)/i,
    async (message, { groups }) => {
      log(`Weather request for ${groups.input}`);

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

      const location = await getLatitudeAndLongitude(groups.input);
      const data = await getDarkSkyForecast(...location.coordinates);
      message.channel.send(getWeatherEmbed(location.name, data));
      analytics.trackUsage('lookup', message);
    }
  );
};
