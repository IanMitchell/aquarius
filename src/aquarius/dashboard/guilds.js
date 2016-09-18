const chalk = require('chalk');
const contrib = require('blessed-contrib');
const Dashboard = require('./dashboard');
const client = require('../core/client');

const table = Dashboard.Grid.set(0, 2, 2, 2, contrib.table, {
  // fg: 'white',
  // bg: 'black',
  // selectedFg: 'black',
  // selectedBg: 'green',
  interactive: true,
  tags: true,
  label: 'Guild List',
  columnSpacing: 3,
  columnWidth: [3, 20, 6],
});

table.focus();

function renderTable() {
  const tableData = [];

  client.guilds.array().forEach(guild => {
    let status = chalk.bgGreen.bold.white(' ✔ ');

    const admin = guild.roles.array().some(role => {
      return guild.member(client.user).hasPermission('ADMINISTRATOR');
    });

    if (admin) {
      status = chalk.bgBlue.bold.white(' ~ ');
    } else if (false) { // TODO: Update with "muted"
      status = chalk.bgRed.bold.white(' x ');
    }

    const userCount = guild.members.array().filter(member => member.user.status !== 'offline').length;

    tableData.push([
      status,
      guild.name,
      `${userCount}(${guild.memberCount})`,
    ]);
  });

  table.setData({ headers: ['', 'Guild', 'Users'], data: tableData });
  // table.setData(tableData);
  Dashboard.Screen.render();
}

client.on('ready', renderTable);
client.on('serverCreated', renderTable);
client.on('serverDeleted', renderTable);

Dashboard.Screen.append(table);
