const contrib = require('blessed-contrib');
const Dashboard = require('./dashboard');
const client = require('../core/client');

const HISTORY = 5;

let messageCounter = 0;
client.on('message', () => messageCounter++);

const yAxis = [];
const xAxis = [];

for (let i = 0; i < HISTORY; i++) {
  yAxis.push(0);
  xAxis.push(`${HISTORY - i}s`);
}

const line = Dashboard.Grid.set(0, 4, 3, 4, contrib.line, {
  style: {
    line: 'blue',
    text: 'white',
    baseline: 'white',
  },
  xLabelPadding: 3,
  xPadding: 5,
  wholeNumbersOnly: true,
  label: 'Incoming Messages',
});

function updateGraph() {
  yAxis.push(messageCounter);
  messageCounter = 0;

  if (yAxis.length > HISTORY) {
    yAxis.shift();
  }

  const series = {
    title: 'Messages',
    x: xAxis,
    y: yAxis,
  };

  line.setData([series]);
  Dashboard.Screen.render();
}

Dashboard.Screen.append(line);
setInterval(updateGraph, 1000);
