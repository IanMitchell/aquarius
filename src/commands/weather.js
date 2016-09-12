const Aquarius = require('../aquarius');
const fetch = require('node-fetch');

const EMOJI_LIST = {
    SUNNY: '☀️',
    PARTLY_CLOUDY: '🌤',
    MOSTLY_CLOUDY: '🌥',
    RAINY: '🌧',
    MIXED: '🌦',
    OVERCAST: '☁',
    THUNDER: '⛈',
    SNOW: '❄️',
    SNOWY: '🌨',
    TORNADO: '🌪',
    HURRICANE: '🌀',
    FOGGY: '🌫',
    WINDY: '💨',
    UNKNOWN: '❓',
};

class Weather extends Aquarius.Command {
    constructor() {
        super();

        this.description = 'Ten day weather forecasts';
    }

    helpMessage(server) {
        let msg = super.helpMessage();
        const nickname = Aquarius.Users.getNickname(server, this.client.user);

        msg += 'Usage:\n';
        msg += `\`\`\`@${nickname} weather [search term]\`\`\``;
        return msg;
    }

    getWeather(search) {
        const query = `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where u='f' AND woeid in (select woeid from geo.places(1) where text="${search}")&format=json`;

        return fetch(query).then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    if (data.query.count > 0) {
                        return this.forecast(data.query.results.channel);
                    }

                    return 'No results found';
                });
            }

            this.log(`Weather Request Error ${response}`);
            throw new Error(response);
        }).catch(error => Error(error));
    }

    forecast(response) {
        let msg = `Weather for **${response.location.city}, ${response.location.region}**:\n\n`;

        msg += '```';
        response.item.forecast.forEach(day => {
            const emoji = this.weatherToEmoji(day.code);
            msg += `${emoji} ${day.day}    `;

            msg += `(${day.high}/${day.low})°F    `;
            msg += `(${this.fahrenheitToCelsius(day.high)}/${this.fahrenheitToCelsius(day.low)})°C\n`;
        });
        msg += '```';

        return msg;
    }

    fahrenheitToCelsius(degrees) {
        return Math.round((degrees - 32) * (5 / 9));
    }

    weatherToEmoji(code) {
        switch (code) {
            case '0':    // Tornado
                return EMOJI_LIST.TORNADO;
            case '1':    // Tropical Storm
            case '2':    // Hurricane
                return EMOJI_LIST.HURRICANE;
            case '3':    // Severe Thunderstorms
            case '4':    // Thunderstorms
            case '37':   // Isolated Thunderstorms
            case '38':   // Scattered Thunderstorms
            case '39':   // Scattered Thunderstorms
            case '45':   // Thundershowers
                return EMOJI_LIST.THUNDER; // Emoji does not represent isolated thundershowers at all
            case '47':   // Isolated Thundershowers
            case '5':    // Mixed Rain and Snow
            case '7':    // Mixed Snow and Sleet
            case '13':   // Snow Flurries
            case '14':   // Light Snow Showers
            case '15':   // Blowing Snow
            case '16':   // Snow
                return EMOJI_LIST.SNOW;
            case '42':   // Scattered Snow Showers
            case '41':   // Heavy Snow
            case '43':   // Heavy Snow
            case '46':   // Snow Showers
                return EMOJI_LIST.SNOWY;
            case '6':    // Mixed Rain and Sleet
            case '8':    // Freezing Drizzle
            case '9':    // Drizzle
            case '10':   // Freezing Rain
            case '11':   // Showers
            case '12':   // Showers
            case '35':   // Mixed rain and hail
            case '40':   // Scattered Showers
                return EMOJI_LIST.RAINY;
            case '17':   // Hail
            case '18':   // Sleet
            case '25':   // Cold
                return EMOJI_LIST.UNKNOWN; // TODO: Find Emoji
            case '19':   // Dust
            case '20':   // Foggy
            case '21':   // Haze
                return EMOJI_LIST.FOGGY;
            case '22':   // Smoky
            case '23':   // Blustery
            case '24':   // Windy
                return EMOJI_LIST.WINDY;
            case '26':   // Cloudy
                return EMOJI_LIST.OVERCAST;
            case '27':   // Mostly Cloudy (night)
            case '28':   // Mostly Cloudy (day)
                return EMOJI_LIST.MOSTLY_CLOUDY;
            case '29':   // Partly Cloudy (night)
            case '30':   // Partly Cloudy (day)
            case '44':   // Partly Cloudy
                return EMOJI_LIST.PARTLY_CLOUDY;
            case '31':   // Clear (night)
            case '32':   // Sunny
            case '33':   // Fair (night)
            case '34':   // Fair (day)
            case '36':   // Hot
                return EMOJI_LIST.SUNNY;
            case '3200': // Not Available
            default:
                return EMOJI_LIST.UNKNOWN;
        }
    }

    message(msg) {
        const weatherInput = Aquarius.Triggers.messageTriggered(msg, /^(?:w|weather) (.*)/i);

        if (weatherInput) {
            this.log(`Weather request for ${weatherInput[1]}`);

            Aquarius.Loading.startLoading(msg.channel)
                .then(() => {
                    try {
                        return this.getWeather(weatherInput[1]);
                    } catch (e) {
                        return e.message;
                    }
                })
                .then(message => {
                    Aquarius.Client.sendMessage(msg.channel, message);
                    Aquarius.Loading.stopLoading(msg.channel);
                });
        }

        return false;
    }
}

module.exports = new Weather();
