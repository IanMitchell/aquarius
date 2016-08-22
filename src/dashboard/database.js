const contrib = require('blessed-contrib');
const Dashboard = require('./dashboard');

const DatabaseLog = (function () {
  const log = Dashboard.Grid.set(3, 4, 2, 4, contrib.log, {
    label: 'Database',
    fg: 'purple',
  });

  Dashboard.Screen.append(log);

  return log;
}());

function logLine(text) {
  DatabaseLog.log(text);
  Dashboard.Screen.render();
}


module.exports = logLine;
