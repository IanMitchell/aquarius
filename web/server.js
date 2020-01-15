import express from 'express';
import debug from 'debug';
import { Constants } from 'discord.js';
import aquarius from '../src/aquarius';
import createShield from './shields';
import { botLink } from '../src/lib/helpers/links';
import { getTotalUserCount } from '../src/lib/metrics/users';
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
  response.json(
    createShield(
      aquarius,
      'Guilds',
      aquarius.guilds.array().length.toLocaleString()
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
