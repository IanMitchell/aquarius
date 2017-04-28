const Discord = require('discord.js');
const fetch = require('node-fetch');
const querystring = require('querystring');
const moment = require('moment');
const FormData = require('form-data');
const Aquarius = require('../aquarius');

const SHOWTIMES = {
  SERVER: process.env.SHOWTIMES_SERVER,
  KEY: process.env.SHOWTIMES_KEY,
};

const TVDB_URL = 'https://api.thetvdb.com';

class ShowtimesError extends Error {
  constructor(message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

class Showtimes extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'Read and Update Showtimes database from Discord';
    this.posterCache = new Map();
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} blame [show]\`\`\``;
    return msg;
  }

  checkForAreki(msg) {
    if (msg.author.id === '132203481565102080' &&
        msg.cleanContent.toLowerCase().includes('.done') &&
        msg.cleanContent.toLowerCase().includes('akagami')) {
      const responses = [
        'Uh huh.',
        'Ok, sure.',
        'Yeah right.',
        'lol.',
        'bullshit.',
        'Funny joke.',
      ];

      msg.channel.sendMessage(responses[Math.floor(Math.random() * responses.length)]);

      return true;
    }

    return false;
  }

  convertStatus(status) {
    return (status === 'done' ? 'true' : 'false');
  }

  getShowPoster(name) {
    if (this.posterCache.has(name)) {
      return new Promise(resolve => resolve(this.posterCache.get(name)));
    }

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ apikey: process.env.TVDB_API_KEY });

    return fetch(`${TVDB_URL}/login`, { method: 'POST', headers, body })
      .then(res => res.json())
      .then(res => {
        if (!res.token) {
          throw new Error('Could not connect to TVDB API');
        }

        headers.Authorization = `Bearer ${res.token}`;
        return fetch(`${TVDB_URL}/search/series?name=${name}`, { headers });
      })
      .then(res => res.json())
      .then(res => {
        const id = res.data[0].id;
        return fetch(`${TVDB_URL}/series/${id}/images/query?keyType=poster`, { headers });
      })
      .then(res => res.json())
      .then(res => {
        const results = res.data.sort((a, b) => a.ratingsInfo.average < b.ratingsInfo.average);
        const url = `https://thetvdb.com/banners/${results[0].fileName}`;

        this.posterCache.set(name, url);
        return url;
      })
      .catch(this.log);
  }

  showEmbedMessage(msg, json) {
    this.getShowPoster(json.name)
      .then(thumbnail => {
        const message = new Discord.RichEmbed({
          title: `${json.name} #${json.episode}`,
          color: 0x008000,
          footer: {
            text: 'Brought to you by Deschtimes™',
          },
          thumbnail: {
            url: thumbnail,
            width: 200,
            height: 295,
          },
        });

        const updatedDate = moment(new Date(json.updated_at));
        const airDate = moment(new Date(json.air_date));
        const status = new Map();

        json.status.forEach(staff => {
          // Pending takes precedence
          if (staff.finished && !status.has(staff.acronym)) {
            status.set(staff.acronym, `~~${staff.acronym}~~`);
          } else if (!staff.finished) {
            status.set(staff.acronym, `**${staff.acronym}**`);
          }
        });

        message.addField('Status', [...status.values()].join(' '));

        if (updatedDate > airDate) {
          message.addField('Last Update', updatedDate.fromNow());
        } else {
          message.addField((airDate > Date.now() ? 'Airs' : 'Aired'), airDate.fromNow());
        }

        msg.channel.sendEmbed(message);
      });
  }

  airingMessage(msg) {
    const uri = `${SHOWTIMES.SERVER}/shows.json?platform=discord&channel=${msg.guild.id}`;

    Aquarius.Loading.startLoading(msg.channel);
    fetch(uri)
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          return Promise.reject(new ShowtimesError(data.message));
        }

        let message = '';

        if (data.shows.length > 0) {
          data.shows.forEach(show => {
            const date = Aquarius.Dates.exactDate(moment(new Date(show.air_date)));
            message += `**${show.name}** #${show.episode_number}\n`;
            message += `Airs in ${date}.\n\n`;
          });

          msg.channel.send(message);
        } else {
          msg.channel.send('No more airing shows this season!');
        }

        return Aquarius.Loading.stopLoading(msg.channel);
      })
      .catch(error => {
        this.log(`Error: ${error.message}`);
        Aquarius.Loading.stopLoading(msg.channel);

        if (error instanceof ShowtimesError) {
          msg.channel.sendMessage(error.message);
        } else {
          msg.channel.sendMessage('Sorry, there was an error. Poke Desch');
        }
      });
  }

  staffMessage(msg, show, position, status) {
    const body = new FormData();
    body.append('username', msg.author.id);
    body.append('status', this.convertStatus(status));
    body.append('channel', msg.guild.id);
    body.append('platform', 'discord');
    body.append('name', show.trim());
    body.append('position', position);
    body.append('auth', SHOWTIMES.KEY);

    Aquarius.Loading.startLoading(msg.channel);
    fetch(`${SHOWTIMES.SERVER}/staff`, { method: 'PUT', body })
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        return response.json().then(data => Promise.reject(new ShowtimesError(data.message)));
      })
      .then(data => {
        msg.channel.sendMessage(data);
        Aquarius.Loading.stopLoading(msg.channel);
        return this.blameMessage(msg, show);
      })
      .catch(error => {
        this.log(`Error: ${error.message}`);
        Aquarius.Loading.stopLoading(msg.channel);

        if (error instanceof ShowtimesError) {
          msg.channel.sendMessage(error.message);
        } else {
          msg.channel.sendMessage('Sorry, there was an error. Poke Desch');
        }
      });
  }

  blameMessage(msg, show) {
    const params = querystring.stringify({
      channel: msg.guild.id,
      platform: 'discord',
      show: encodeURIComponent(show.trim()),
    });

    Aquarius.Loading.startLoading(msg.channel);
    fetch(`${SHOWTIMES.SERVER}/blame.json?${params}`)
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          return Promise.reject(new ShowtimesError(data.message));
        }

        this.showEmbedMessage(msg, data);
        return Aquarius.Loading.stopLoading(msg.channel);
      })
      .catch(error => {
        this.log(`Error: ${error.message}`);
        Aquarius.Loading.stopLoading(msg.channel);

        if (error instanceof ShowtimesError) {
          msg.channel.sendMessage(error.message);
        } else {
          msg.channel.sendMessage('Sorry, there was an error. Poke Desch');
        }
      });
  }

  releaseMessage(msg, show) {
    const body = new FormData();
    body.append('platform', 'discord');
    body.append('channel', msg.guild.id);
    body.append('name', show.trim());
    body.append('username', msg.author.id);
    body.append('auth', SHOWTIMES.KEY);

    Aquarius.Loading.startLoading(msg.channel);
    fetch(`${SHOWTIMES.SERVER}/release`, { method: 'PUT', body })
      .then(response => response.json())
      .then(data => {
        Aquarius.Loading.stopLoading(msg.channel);
        msg.channel.sendMessage(data.message);
      })
      .catch(error => {
        this.log(`Error: ${error.message}`);
        Aquarius.Loading.stopLoading(msg.channel);
        msg.channel.sendMessage('Sorry, there was an error. Poke Desch');
      });
  }

  message(msg) {
    if (this.checkForAreki(msg)) {
      return;
    }

    const blameInput = Aquarius.Triggers.messageTriggered(msg, /^blame (.+)$/i);
    const staffInput = Aquarius.Triggers.messageTriggered(msg, /^(?:(?:(done|undone) (tl|tlc|enc|ed|tm|ts|qc) (.+)))$/i);
    const releaseInput = Aquarius.Triggers.messageTriggered(msg, /^release\s(.+)$/i);
    const airingInput = Aquarius.Triggers.messageTriggered(msg, /^airing$/i);

    if (blameInput) {
      this.log(`Blame request for ${blameInput[1]} in ${msg.guild.name}`);
      this.blameMessage(msg, blameInput[1]);
    }

    if (staffInput) {
      this.log(`${staffInput[1]} request for ${staffInput[3]} by ${msg.author.username}`);
      this.staffMessage(msg, staffInput[3], staffInput[2], staffInput[1]);
    }

    if (releaseInput) {
      this.log(`Release request for ${releaseInput[1]} by ${msg.author.username}`);
      this.releaseMessage(msg, releaseInput[1]);
    }

    if (airingInput) {
      this.log(`Airing input by ${msg.author.username}`);
      this.airingMessage(msg);
    }
  }
}

module.exports = new Showtimes();
