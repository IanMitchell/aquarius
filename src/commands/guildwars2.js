const fs = require('fs');
const readline = require('readline');
const Aquarius = require('../aquarius');

const INTERVAL = 5;
const INTERVAL_MS = 1000 * 60 * INTERVAL;


// PAD POLYFILL BULLSHIT
function padStart (text, max, mask) {
  const cur = text.length;
  if (max <= cur) {
    return text;
  }
  const masked = max - cur;
  let filler = String(mask) || ' ';
  while (filler.length < masked) {
    filler += filler;
  }
  const fillerSlice = filler.slice(0, masked);
  return fillerSlice + text;
}

if (!String.prototype.padStart) {
  String.prototype.padStart = function (max, fillString) {
    return padStart(this, max, fillString);
  };
} else {
  console.log('WARNING: GW PADSTART POLYFILL NO LONGER NEEDED');
}
// END PAD POLYFILL BULLSHIT

class GuildWars extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Timer alerts for world events';

    this.settings.addKey('channel', null, 'Where to post event alerts');

    this.eventList = [];
    this.loadData();

    // Start Timer
    const date = new Date();
    const minutes = INTERVAL - ((date.getMinutes() % INTERVAL) + 1);
    const seconds = (60 - date.getSeconds());

    this.log(`Setting loop to start in ${minutes}m and ${seconds}s`);
    setTimeout(this.startLoop.bind(this), ((minutes * 60) + seconds) * 1000);
  }

  loadData() {
    // TODO: Make into Framework option
    const path = `${__dirname}/../../data/guildwars2/`;
    fs.readdir(path, (err, files) => {
      if (err) {
        this.log(err);
      }

      files.forEach(file => {
        if (file.endsWith('.csv')) {
          const rl = readline.createInterface({
            input: fs.createReadStream(`${path}${file}`),
          });

          rl.on('line', line => {
            const [name, ...times] = line.split(',');
            this.eventList.push({ name, times });
          }).on('close', () => {
            this.log(`Loaded ${file}`);
          });
        }
      });
    });
  }

  checkTimers() {
    const date = new Date(Date.now() + INTERVAL_MS);
    const str = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    this.log(`Checking timers on ${str}.`);

    this.eventList.forEach(event => {
      if (event.times.find(time => time === str)) {
        this.log(`Sending alert for ${event.name}`);

        Aquarius.Client.guilds.forEach(guild => {
          if (Aquarius.Permissions.isCommandEnabled(guild, this)) {
            const target = this.getSetting(guild.id, 'channel');
            let channel = guild.defaultChannel;

            if (target !== null && target !== '') {
              channel = guild.channels.array().find(c => c.name === target);
            }

            channel.sendMessage(`🚨 Starting in ${INTERVAL}m: ${event.name}`);
          }
        });
      }
    });
  }

  startLoop() {
    this.checkTimers();
    setInterval(this.checkTimers.bind(this), INTERVAL_MS);
  }
}

module.exports = new GuildWars();
