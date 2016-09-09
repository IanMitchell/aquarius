const Aquarius = require('../aquarius');
const fetch = require('node-fetch');
const FormData = require('form-data');
const moment = require('moment');

const SHOWTIMES = {
  SERVER: 'http://showtimes.herokuapp.com',
  KEY: process.env.SHOWTIMES_KEY,
};

class Showtimes extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'Read and Update Showtimes database from Discord';
  }

  blameRequest(guild, show) {
    this.log(`Blame request for ${show}`);

    let uri = `${SHOWTIMES.SERVER}/blame.json?`;
    uri += `channel=${guild}`;
    uri += '&platform=discord';
    uri += `&show=${encodeURIComponent(show.trim())}`;

    return fetch(uri).then(response => {
      if (response.ok) {
        return response.json().then(data => this.blameMessage(data));
      }

      // TODO: Test / Look At
      return response.json().then(data => {
        this.log('Blame Request Error:');
        this.log(data);
        Error(data.message);
      });
    }).catch(error => Error(error));
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

      // TODO: Test / Look At
      return response.json().then(data => {
        this.log('Staff Request Error:');
        this.log(data);
        Error(data.message);
      });
    }).catch(error => Error(error));
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

  helpMessage(guild) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(guild, Aquarius.Client.user);

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} blame [show]\`\`\``;
    return msg;
  }

  message(msg) {
    const blameInput = Aquarius.Triggers.messageTriggered(msg, /^blame (.+)$/i);
    const staffInput = Aquarius.Triggers.messageTriggered(msg, /^(?:(?:(done|undone) (tl|tlc|enc|ed|tm|ts|qc) (.+)))$/i);


    if (blameInput) {
      Aquarius.Loading.startLoading(msg.channel)
        .then(() => this.blameRequest(msg.guild.id, blameInput[1]))
        .then(message => {
          msg.channel.sendMessage(message);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }

    if (staffInput) {
      Aquarius.Loading.startLoading(msg.channel)
        .then(() => this.staffRequest(msg.guild.id,
                                      staffInput[3],
                                      msg.author.id,
                                      staffInput[2],
                                      staffInput[1]))
        .then(message => {
          msg.channel.sendMessage(message);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }

    return false;
  }
}

module.exports = new Showtimes();
