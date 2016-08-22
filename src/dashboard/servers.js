const blessed = require('blessed');
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
  label: 'Server List',
  columnSpacing: 3,
  columnWidth: [3, 20, 6],
});

table.focus();

function renderTable() {
  const tableData = [];
  client.servers.forEach(server => {
    let status = chalk.bgGreen.bold.white(' ✔ ');

    const admin = server.roles.some(role => {
      return client.user.hasRole(role) && role.hasPermission('administrator');
    });

    if (admin) {
      status = chalk.bgBlue.bold.white(' ~ ');
    } else if (false) { // TODO: Update with "muted"
      status = chalk.bgRed.bold.white(' x ');
    }

    const userCount = server.members.filter(user => user.status !== 'offline').length;

    tableData.push([
      status,
      server.name,
      `${userCount}(${server.members.length})`,
    ]);
  });

  table.setData({ headers: ['', 'Server', 'Users'], data: tableData });
  // table.setData(tableData);
  Dashboard.Screen.render();
}

client.on('ready', renderTable);
client.on('serverCreated', renderTable);
client.on('serverDeleted', renderTable);

Dashboard.Screen.append(table);
