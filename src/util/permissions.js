const client = require('../client');

const isBotOwner = (user) => user.id === process.env.OWNER_ID;

const isBotModerator = (server, user) => {
  if (isBotOwner(user) || server.owner.equals(user)) {
    return true;
  }

  return server.rolesOfUser(user).some(role => role.name === `${client.user.name} Mod`);
};

module.exports = {
  isBotModerator,
  isBotOwner,
};
