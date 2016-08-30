const contrib = require('blessed-contrib');
const Dashboard = require('./dashboard');

const Log = (function () {
  const log = Dashboard.Grid.set(2, 0, 3, 4, contrib.log, {
    label: 'Log',
  });

  Dashboard.Screen.append(log);

  return log;
}());

function logLine(text) {
  Log.log(text);
  Dashboard.Screen.render();
}


module.exports = logLine;
