import { Constants } from 'discord.js';
import fastify from 'fastify';
import cors from 'fastify-cors';
import getLogger from '../../core/logging/log';
import aquarius from '../src/aquarius';
import { botLink } from '../src/core/helpers/links';
import { getTotalUserCount } from '../src/core/metrics/discord';
import createShield from './shields';
// import { getMetricHandler } from './metrics';

const server = fastify();
server.register(cors);

const log = getLogger('Server');

server.get('/', (request, response) => {
  return response.json({
    server: 'hello world',
    whereAreTheDocs: "Yeah yeah, I'm working on it. DM me - Desch#3091",
  });
});

server.get('/shield/guilds', (request, response) => {
  return response.send(
    createShield(
      'Guilds',
      aquarius.guilds.cache.array().length.toLocaleString()
    )
  );
});

server.get('/shield/users', (request, response) => {
  return response.send(
    createShield('Users', getTotalUserCount().toLocaleString())
  );
});

server.get('/shield/commands', (request, response) => {
  return response.send(
    createShield('Commands', aquarius.commandList.size.toLocaleString())
  );
});

server.get('/link', (request, response) => {
  log.info('Link Request');
  return response.send({ url: botLink() });
});

server.get('/ping', (request, response) => {
  log.info('Ping Request');
  if (aquarius.status === Constants.Status.READY) {
    return response.send({ ping: aquarius.ping.toString() });
  }

  return response.code(500).send({ error: 'Aquarius is not ready' });
});

// TODO: Implement
// app.get('/contributors', (request, response) => {
//   // TODO: Find all users in home guild with X Role
//   return status(200);
// });

server.get('/health', async (request, response) => {
  log.info('Health Request');
  // TODO: Check some stuff
  return response.code(200);
});

export default (async () => {
  try {
    await server.listen(3030);
  } catch (error) {
    log.fatal(error.message);
    process.exit(1);
  }
})();
