const client = require('../core/client');
const settings = require('../core/settings');
const users = require('./users');

function isBotOwner(user) {
  return user.id === process.env.OWNER_ID;
}

function isServerAdmin(server, user) {
  return isBotOwner(user) || server.owner.equals(user);
}

function isServerModerator(server, user) {
  if (isServerAdmin(server, user)) {
    return true;
  }

  const nameRole = users.hasRole(server, user, `${client.user.name} Mod`);
  const nickRole = users.hasRole(server, user, `${users.getNickname(server, client.user)} Mod`);

  return nameRole || nickRole;
}

function isServerMuted(server, user) {
  const nameRole = users.hasRole(server, user, `${client.user.name} Muted`);
  const nickRole = users.hasRole(server, user, `${users.getNickname(server, client.user)} Muted`);

  return nameRole || nickRole;
}

function hasPermission(server, user, command) {
  const permission = settings.getPermission(server.id, command);

  switch (permission) {
    case 2: // ADMIN
      return isServerAdmin(user);
    case 1: // RESTRICTED
      return isServerModerator(user);
    case 0: // ALL
      return true;
    default:
      return false;
  }
}

module.exports = {
  isBotOwner,
  isServerAdmin,
  isServerModerator,
  isServerMuted,
  hasPermission,
};
