import test from 'ava';
import proxyquire from 'proxyquire';
import ServerStub from '../helpers/server-stub';
import UserStub from '../helpers/user-stub';
import RoleStub from '../helpers/role-stub';
import ClientStub from '../helpers/client-stub';

const permissions = proxyquire('../../src/util/permissions', {
  '../core/client': ClientStub,
  './users': proxyquire('../../src/util/users', {
    '../core/client': ClientStub,
  }),
});

test('isBotOwner', t => {
  process.env.OWNER_ID = '0';

  const user = new UserStub('0');

  let output = permissions.isBotOwner(user);
  t.true(output, 'Did not identify bot owner');

  user.id = 1;
  output = permissions.isBotOwner(user);
  t.false(output, 'Incorrectly identified bot owner');
});

test('isServerAdmin', t => {
  process.env.OWNER_ID = '0';

  const server = new ServerStub();
  const user = new UserStub('0');
  server.users.push(user);

  let output = permissions.isServerAdmin(server, user);
  t.true(output, 'Did not identify bot owner and server admin');

  server.owner.id = '1';
  output = permissions.isServerAdmin(server, user);
  t.true(output, 'Did not identify bot owner who is not server admin');

  user.id = '1';
  output = permissions.isServerAdmin(server, user);
  t.true(output, 'Did not identify server admin');

  user.id = '2';
  output = permissions.isServerAdmin(server, user);
  t.false(output, 'Incorrectly identified server admin');

  const newServer = new ServerStub();
  newServer.users.push(user);
  user.id = '1';
  output = permissions.isServerAdmin(newServer, user);
  t.false(output, 'Incorrectly identified server admin on different server');
});

test('isServerModerator', t => {
  process.env.OWNER_ID = '0';

  const server = new ServerStub();
  const user = new UserStub('0');

  let output = permissions.isServerModerator(server, user);
  t.true(output, 'Did not identify bot owner');

  server.owner.id = '1';
  user.id = '1';
  output = permissions.isServerModerator(server, user);
  t.true(output, 'Did not identify server admin');

  server.roles.push(new RoleStub(user, 'Aquarius Mod'));
  user.id = '2';
  output = permissions.isServerModerator(server, user);
  t.true(output, 'Did not identify Aquarius Mod role');

  server.roles.push(new RoleStub(user, 'Belfiore Mod'));
  ClientStub.user.nick = 'Belfiore';
  output = permissions.isServerModerator(server, user);
  t.true(output, 'Did not identify both Aquarius and Belfiore Mod roles');

  server.roles.shift();
  output = permissions.isServerModerator(server, user);
  t.true(output, 'Did not identify Belfiore Mod role');

  server.roles.shift();
  output = permissions.isServerModerator(server, user);
  t.false(output, 'Incorrectly identified server moderator');

  const newServer = new ServerStub();
  newServer.users.push(user);
  newServer.roles.push(new RoleStub(user, 'Aquarius Mod'));
  output = permissions.isServerModerator(server, user);
  t.false(output, 'Incorrectly identified server moderator on different server');
});

test('isServerMuted', t => {
  process.env.OWNER_ID = '0';

  const server = new ServerStub();
  const user = new UserStub('0');

  server.roles.push(new RoleStub(user, 'Aquarius Muted'));
  let output = permissions.isServerMuted(server, user);
  t.false(output, 'Incorrectly flagged bot owner');

  server.owner.id = '1';
  user.id = '1';
  output = permissions.isServerMuted(server, user);
  t.false(output, 'Incorrectly flagged server admin');

  user.id = '2';
  server.roles.shift();
  output = permissions.isServerMuted(server, user);
  t.false(output, 'Incorrectly flagged user');

  server.roles.push(new RoleStub(user, 'Aquarius Muted'));
  output = permissions.isServerMuted(server, user);
  t.true(output, 'Did not identify Aquarius Muted role');

  ClientStub.user.nick = 'Belfiore';
  server.roles.push(new RoleStub(user, 'Belfiore Muted'));
  output = permissions.isServerMuted(server, user);
  t.true(output, 'Did not identify both Aquarius and Belfiore Muted roles');

  server.roles.shift();
  output = permissions.isServerMuted(server, user);
  t.true(output, 'Did not identify Belfiore Muted role');

  const newServer = new ServerStub();
  newServer.users.push(user);
  output = permissions.isServerMuted(newServer, user);
  t.false(output, 'Incorrectly identified server mute on different server');
});

test.todo('hasPermission');
