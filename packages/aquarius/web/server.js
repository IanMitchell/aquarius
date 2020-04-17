import cors from 'cors';
import debug from 'debug';
import Discord from 'discord.js';
import express from 'express';
import aquarius from '../src/aquarius';
import { botLink } from '../src/core/helpers/links';
import { getTotalUserCount } from '../src/core/metrics/users';
import createShield from './shields';
// import { getMetricHandler } from './metrics';

// CJS / ESM compatibility
const { Constants } = Discord;

const log = debug('Server');
const app = express();

app.use(cors());

// const metricHandler = getMetricHandler();

app.get('/', (request, response) => {
  return response.json({
    server: 'hello world',
    whereAreTheDocs: "Yeah yeah, I'm working on it. DM me - Desch#3091",
  });
});

app.get('/shield/guilds', (request, response) => {
  response.json(
    createShield(
      aquarius,
      'Guilds',
      aquarius.guilds.cache.array().length.toLocaleString()
    )
  );
});

app.get('/shield/users', (request, response) => {
  response.json(
    createShield(aquarius, 'Users', getTotalUserCount().toLocaleString())
  );
});

app.get('/shield/commands', (request, response) => {
  return response.json(
    createShield(
      aquarius,
      'Commands',
      aquarius.commandList.size.toLocaleString()
    )
  );
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
