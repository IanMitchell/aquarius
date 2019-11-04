import express from 'express';
import debug from 'debug';
import { Constants } from 'discord.js';
import aquarius from '../src';
import { botLink } from '../src/lib/helpers/links';
// import { getMetricHandler } from './metrics';

const log = debug('Server');
const app = express();

// const metricHandler = getMetricHandler();

app.get('/', (request, response) => {
  return response.json({ server: 'hello world' });
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
