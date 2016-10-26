const Aquarius = require('../aquarius');
const fetch = require('node-fetch');
const FormData = require('form-data');
const moment = require('moment');

const SHOWTIMES = {
  SERVER: process.env.SHOWTIMES_SERVER,
  KEY: process.env.SHOWTIMES_KEY,
};

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
  }

  blameRequest(guild, show) {
    let uri = `${SHOWTIMES.SERVER}/blame.json?`;
    uri += `channel=${guild}`;
    uri += '&platform=discord';
    uri += `&show=${encodeURIComponent(show.trim())}`;

    return fetch(uri).then(response => {
      if (response.ok) {
        return response.json().then(data => this.blameMessage(data));
      }

      return response.json().then(data => Promise.reject(new ShowtimesError(data.message)));
    }).catch(error => Promise.reject(error));
  }

  staffRequest(guild, show, user, position, status) {
    const form = new FormData();
    form.append('username', user);
    form.append('status', this.convertStatus(status));
    form.append('channel', guild);
    form.append('platform', 'discord');
    form.append('name', show.trim());
    form.append('position', position);
    form.append('auth', SHOWTIMES.KEY);

    return fetch(`${SHOWTIMES.SERVER}/staff`, { method: 'PUT', body: form }).then(response => {
      if (response.ok) {
        return response.json().then(data => this.staffMessage(guild, show, data));
      }

      return response.json().then(data => Promise.reject(new ShowtimesError(data.message)));
    }).catch(error => Promise.reject(error));
  }

  releaseRequest(guild, user, show) {
    const form = new FormData();
    form.append('platform', 'discord');
    form.append('channel', guild);
    form.append('name', show.trim());
    form.append('auth', SHOWTIMES.KEY);

    return fetch(`${SHOWTIMES.SERVER}/release`, { method: 'PUT', body: form }).then(response => {
      if (response.ok) {
        return response.json().then(data => data.message);
      }

      return response.json().then(data => Promise.reject(new ShowtimesError(data.message)));
    }).catch(error => Promise.reject(error));
  }

  airingRequest(guild) {
    const uri = `${SHOWTIMES.SERVER}/shows.json?platform=discord&channel=${guild}`;
    return fetch(uri).then(response => {
      if (response.ok) {
        return response.json().then(data => this.airingMessage(data));
      }

      return response.json().then(data => Promise.reject(new ShowtimesError(data.message)));
    }).catch(error => Promise.reject(error));
  }

  airingMessage(json) {
    if (json.message) {
      return json.message;
    }

    let message = '';

    if (json.shows.length > 0) {
      json.shows.forEach(show => {
        const date = Aquarius.Dates.exactDate(moment(new Date(show.air_date)));
        message += `**${show.name}** #${show.episode_number}\n`;
        message += `Airs in ${date}.\n\n`;
      });

      return message;
    }

    return 'No more airing shows this season!';
  }

  convertStatus(status) {
    return (status === 'done' ? 'true' : 'false');
  }

  blameMessage(json) {
    if (json.message) {
      return json.message;
    }

    const updatedDate = moment(new Date(json.updated_at));
    const airDate = moment(new Date(json.air_date));
    const status = new Map();
    let job = 'release';

    let message = `Ep #${json.episode} of **${json.name}**`;

    json.status.forEach(staff => {
      // Pending takes precedence
      if (staff.finished && !status.has(staff.acronym)) {
        status.set(staff.acronym, `~~${staff.acronym}~~`);
      } else if (!staff.finished) {
        status.set(staff.acronym, `**${staff.acronym}**`);

        // TODO: Fix
        if (job === 'release') {
          job = staff.position;
        }
      }
    });

    if (updatedDate > airDate) {
      message += ` is at ${job} (last update ${updatedDate.fromNow()}). `;
    } else {
      message += airDate > Date.now() ? ' airs' : ' aired';
      message += ` ${airDate.fromNow()}. `;
    }

    message += `\n${[...status.values()].join(' ')}`;

    return message;
  }

  staffMessage(guild, show, json) {
    const msg = json.message;
    return this.blameRequest(guild, show).then(res => `${msg}. ${res}`);
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} blame [show]\`\`\``;
    return msg;
  }

  message(msg) {
    let request = null;
    const blameInput = Aquarius.Triggers.messageTriggered(msg, /^blame (.+)$/i);
    const staffInput = Aquarius.Triggers.messageTriggered(msg, /^(?:(?:(done|undone) (tl|tlc|enc|ed|tm|ts|qc) (.+)))$/i);
    const releaseInput = Aquarius.Triggers.messageTriggered(msg, /^release\s(.+)$/i);
    const airingInput = Aquarius.Triggers.messageTriggered(msg, /^airing$/i);

    if (blameInput) {
      this.log(`Blame request for ${blameInput[1]} in ${msg.guild.name}`);
      Aquarius.Loading.startLoading(msg.channel);
      request = this.blameRequest(msg.guild.id, blameInput[1]);
    }

    if (staffInput) {
      this.log(`${staffInput[1]} request for ${staffInput[3]} by ${msg.author.username}`);
      Aquarius.Loading.startLoading(msg.channel);
      request = this.staffRequest(msg.guild.id,
                                  staffInput[3],
                                  msg.author.id,
                                  staffInput[2],
                                  staffInput[1]);
    }

    if (releaseInput) {
      this.log(`Release request for ${releaseInput[1]} by ${msg.author.username}`);
      Aquarius.Loading.startLoading(msg.channel);
      request = this.releaseRequest(msg.guild.id, msg.author.id, releaseInput[1]);
    }

    if (airingInput) {
      this.log(`Airing input by ${msg.author.username}`);
      Aquarius.Loading.startLoading(msg.channel);
      request = this.airingRequest(msg.guild.id);
    }

    if (request) {
      request.then(message => {
        msg.channel.sendMessage(message);
        Aquarius.Loading.stopLoading(msg.channel);
      }, error => {
        this.log(`Error: ${error.message}`);
        Aquarius.Loading.stopLoading(msg.channel);

        if (error instanceof ShowtimesError) {
          msg.channel.sendMessage(error.message);
        } else {
          msg.channel.sendMessage('Sorry, there was an error. Poke Desch');
        }
      });
    }
  }
}

module.exports = new Showtimes();
