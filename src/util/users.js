const client = require('../core/client');

function getUser(id) {
  return client.users.get('id', id);
}

function getNickname(server, user) {
  if (typeof user === 'string') {
    return server.detailsOf(getUser(user)).nick || getUser(user).name;
  }

  return server.detailsOf(user).nick || user.name;
}

function hasRole(server, user, roleName) {
  return server.rolesOfUser(user).some(role => role.name === roleName);
}

module.exports = {
  getUser,
  getNickname,
  hasRole,
};
