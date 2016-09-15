const client = require('./client');

function getOwnedGuilds(user) {
  return client.guilds.array().filter(guild => guild.owner.user.equals(user));
}

function getUser(id) {
  return client.users.find('id', id);
}

function getNickname(guild, user) {
  if (guild === null || guild === undefined) {
    return user.name;
  }

  if (typeof user === 'string') {
    return guild.members.get(getUser(user)).nick || getUser(user).name;
  }

  return guild.members.find('id', user.id).nick || user.name;
}

function hasRole(guild, user, roleName) {
  return guild.members.find('id', user.id).roles.array().some(role => role.name === roleName);
}

module.exports = {
  getOwnedGuilds,
  getUser,
  getNickname,
  hasRole,
};
