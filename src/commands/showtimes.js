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

  blameRequest(show) {
    this.log(`Blame request for ${show}`);

    let uri = `${SHOWTIMES.SERVER}/blame.json?`;
    uri += `irc=${encodeURIComponent('#goodjob')}`;
    uri += `&show=${encodeURIComponent(show.trim())}`;

    return fetch(uri).then(response => {
      if (response.ok) {
        return response.json().then(data => this.blameMessage(data));
      }

      // TODO: Test / Look At
      return response.json().then(data => {
        this.log(`Blame Request Error: ${data}`);
        Error(data.message);
      });
    }).catch(error => Error(error));
  }

  staffRequest(show, user, position, status) {
    const form = new FormData();
    form.append('username', user);
    form.append('status', this.convertStatus(status));
    form.append('irc', '#goodjobclub');
    form.append('name', show.trim());
    form.append('auth', SHOWTIMES.KEY);

    return fetch(`${SHOWTIMES.SERVER}/staff`, { method: 'PUT', body: form }).then(response => {
      if (response.ok) {
        return response.json().then(data => this.staffMessage(show, data));
      }

      // TODO: Test / Look At
      return response.json().then(data => {
        this.log(`Staff Request Error: ${data}`);
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

  staffMessage(show, json) {
    const msg = json.message;
    return this.blameRequest(show).then(res => `${msg}. ${res}`);
  }

  helpMessage(server) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(server, this.client.user);

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} blame [show]\`\`\``;
    return msg;
  }

  message(msg) {
    const blameInput = Aquarius.Triggers.messageTriggered(msg, /^blame (.+)$/i);
    const staffInput = Aquarius.Triggers.messageTriggered(msg, /^(?:(?:(done|undone) (tl|tlc|enc|ed|tm|ts|qc) (.+)))$/i);


    if (blameInput) {
      Aquarius.Loading.startLoading(msg.channel)
        .then(() => this.blameRequest(blameInput[1]))
        .then(message => {
          Aquarius.Client.sendMessage(msg.channel, message);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }

    if (staffInput) {
      Aquarius.Loading.startLoading(msg.channel)
        .then(() => this.staffRequest(staffInput[3], msg.author.id, staffInput[2], staffInput[1]))
        .then(message => {
          Aquarius.Client.sendMessage(msg.channel, message);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }

    return false;
  }
}

module.exports = new Showtimes();
