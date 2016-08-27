const client = require('./client');
const users = require('./users');
const settings = require('../settings/settings');

const LEVELS = {
  ADMIN: 2,
  RESTRICTED: 1,
  ALL: 0,
};

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
  if (isServerAdmin(server, user)) {
    return false;
  }

  const nameRole = users.hasRole(server, user, `${client.user.name} Muted`);
  const nickRole = users.hasRole(server, user, `${users.getNickname(server, client.user)} Muted`);

  return nameRole || nickRole;
}

function hasPermission(server, user, command) {
  const permission = settings.getPermission(server.id, command.constructor.name);

  switch (permission) {
    case LEVELS.ADMIN:
      return isServerAdmin(server, user);
    case LEVELS.RESTRICTED:
      return isServerModerator(server, user);
    case LEVELS.ALL:
      return true;
    default:
      return false;
  }
}

module.exports = {
  LEVELS,
  isBotOwner,
  isServerAdmin,
  isServerModerator,
  isServerMuted,
  hasPermission,
};
