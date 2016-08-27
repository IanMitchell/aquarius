const client = require('./client');

function getOwnedServers(user) {
  return client.servers.filter(server => server.owner.equals(user));
}

function getUser(id) {
  return client.users.get('id', id);
}

function getNickname(server, user) {
  if (server === null || server === undefined) {
    return user.name;
  }

  if (typeof user === 'string') {
    return server.detailsOf(getUser(user)).nick || getUser(user).name;
  }

  return server.detailsOf(user).nick || user.name;
}

function hasRole(server, user, roleName) {
  return server.rolesOfUser(user).some(role => role.name === roleName);
}

module.exports = {
  getOwnedServers,
  getUser,
  getNickname,
  hasRole,
};
