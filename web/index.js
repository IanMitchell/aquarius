import debug from 'debug';
import micro, { send } from 'micro';
import match from 'micro-route/match';
import next from 'next';
import socketio from 'socket.io';
import URL from 'url';
import { Constants } from 'discord.js';
import aquarius from '../src';
import { botLink } from '../src/lib/helpers/links';
import { getMetricHandler } from './metrics';

const log = debug('Server');

const metricHandler = getMetricHandler();

// Web Dashboard
const app = next({
  dev: process.env.NODE_ENV !== 'production',
  dir: __dirname,
});
const handle = app.getRequestHandler();


function handleLink(request, response) {
  response.setHeader('Location', botLink());
  return send(response, 301);
}

function handlePing(request, response) {
  if (aquarius.status === Constants.Status.READY) {
    return send(response, 200, aquarius.ping.toString());
  }

  return send(response, 500, 'error');
}

// API Server
const server = micro(async (request, response) => {
  // This should match the URL in `getVanityBotLink`
  if (match(request, '/link')) {
    log('Link Request');
    return handleLink(request, response);
  }

  if (match(request, '/ping')) {
    log('Ping Request');
    return handlePing(request, response);
  }

  log('Dashboard Request');
  return handle(request, response, URL.parse(request.url, true));
});

// Socket.io Events
const io = socketio(server);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    log('user disconnect');
  });

  // // 5 second update loops
  // setInterval(() => {
  //   io.emit('update', {
  //     members: getMembers(),
  //   });
  // }, 1000 * 5);

  // // 30 second update loops
  // setInterval(async () => {
  //   const metrics = await metricHandler.getResourceUsage();
  //   io.emit('updateMetrics', { metrics });
  // }, 1000 * 30);
});

export default (async () => {
  await app.prepare();
  return server.listen(3000);
})();
