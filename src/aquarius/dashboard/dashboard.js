const debug = require('debug');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const log = debug('Dashboard');

const Screen = (function () {
  // Create a screen object.
  const screen = blessed.screen({
    smartCSR: true,
  });

  screen.title = 'Aquarius';

  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

  return screen;
}());

const Grid = (function () {
  const grid = new contrib.grid({
    rows: 5,
    cols: 8,
    screen: Screen,
  });

  return grid;
}());

module.exports = {
  Screen,
  Grid,
};

require('./servers');
require('./info');
require('./messages');
require('./database');
log.log = require('./log');

log('Rendering Dashboard');
