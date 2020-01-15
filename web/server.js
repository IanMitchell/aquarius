import express from 'express';
import debug from 'debug';
import { Constants } from 'discord.js';
import aquarius from '../src/aquarius';
import { botLink } from '../src/lib/helpers/links';
// import { getMetricHandler } from './metrics';

const log = debug('Server');
const app = express();

// const metricHandler = getMetricHandler();

app.get('/', (request, response) => {
  return response.json({
    server: 'hello world',
    whereAreTheDocs: "Yeah yeah, I'm working on it. DM me - Desch#3091",
  });
});

app.get('/shield/guilds', (request, response) => {
  if (aquarius.status !== Constants.Status.READY) {
    return response.json({
      schemaVersion: 1,
      message: 'Guilds',
      label: 'Error',
      color: 'red',
      style: 'for-the-badge',
      isError: true,
    });
  }

  return response.json({
    schemaVersion: 1,
    message: 'Guilds',
    label: aquarius.guilds.array().length.toLocaleString(),
    color: 'green',
    style: 'for-the-badge',
  });
});

app.get('/shield/commands', (request, response) => {
  if (aquarius.status !== Constants.Status.READY) {
    return response.json({
      schemaVersion: 1,
      message: 'Commands',
      label: 'Error',
      color: 'red',
      style: 'for-the-badge',
      isError: true,
    });
  }

  return response.json({
    schemaVersion: 1,
    message: 'Commands',
    label: aquarius.commandList.size,
    color: 'green',
    style: 'for-the-badge',
  });
});

app.get('/link', (request, response) => {
  log('Link Request');
  return response.redirect(301, botLink());
});

app.get('/ping', (request, response) => {
  log('Ping Request');
  if (aquarius.status === Constants.Status.READY) {
    return response.send(aquarius.ping.toString());
  }

  return response.status(500).json({ error: 'bot not running' });
});

app.get('/health', (request, response) => {
  log('Health Request');
  // TODO: Check some stuff
  return response.status(200);
});

export default (async () => {
  return app.listen(3000);
})();
