const blessed = require('blessed');
const chalk = require('chalk');
const Dashboard = require('./dashboard');
const client = require('../core/client');
const formatters = require('../helpers/formatters');

const REFRESH_TIMER = 1000 * 5;

let userCount = 0;

const box = Dashboard.Grid.set(0, 0, 2, 2, blessed.box, {
  label: 'Info',
  tags: true,
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    border: {
      fg: 'white',
    },
  },
});

function countUsers() {
  client.users.forEach(user => {
    if (user.status !== 'offline') {
      userCount++;
    }
  });

  client.on('presence', (oldUser, newUser) => {
    if (oldUser.status === 'offline') {
      userCount++;
    }
    if (newUser.status === 'offline') {
      userCount--;
    }
  });
}

function refreshContent() {
  let content = '';
  content = `${chalk.bold.white('Name')}:{|}${client.user.name}#${client.user.discriminator}\n`;
  // content += `Uptime: ${uptime}\n\n`;
  content += `${chalk.bold.white('Memory')}:{|}${formatters.formatBytes(process.memoryUsage().heapUsed)}\n`;
  // content += `CPU Usage: ${cpu}\n\n`;
  // content += `DB Size: ${dbsize}\n`;
  // content += `Total Rows: ${rows}\n`;
  content += `${chalk.bold.white('Online Members')}:{|}${userCount}`;

  box.setContent(content);
  setTimeout(refreshContent, REFRESH_TIMER);
}

client.on('ready', () => {
  countUsers();
  refreshContent();
});

Dashboard.Screen.append(box);
