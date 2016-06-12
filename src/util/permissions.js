const client = require('../core/client');

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

  return server.rolesOfUser(user).some(role => role.name === `${client.user.name} Mod`);
}

module.exports = {
  isBotOwner,
  isServerAdmin,
  isServerModerator,
};
