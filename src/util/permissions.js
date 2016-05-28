const client = require('../client');

const isBotOwner = (user) => user.id === process.env.OWNER_ID;

const isBotAdmin = (server, user) => (isBotOwner(user) || server.owner.equals(user));

const isBotModerator = (server, user) => {
  if (isBotAdmin(server, user)) {
    return true;
  }

  return server.rolesOfUser(user).some(role => role.name === `${client.user.name} Mod`);
};

module.exports = {
  isBotOwner,
  isBotAdmin,
  isBotModerator,
};
