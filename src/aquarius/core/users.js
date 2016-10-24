const client = require('./client');

function getOwnedGuilds(user) {
  return client.guilds.array().filter(guild => guild.owner.user.equals(user));
}

function getGuildsWithAdmin(user) {
  return client.guilds.array().filter(guild => {
    const user = guild.member(user);
    if (user) {
      return user.hasPermission('ADMINISTRATOR');
    }

    return false;
  });
}

function getUser(id) {
  return client.users.find('id', id);
}

function getNickname(guild, user) {
  if (guild === null || guild === undefined) {
    return user.name;
  }

  return guild.fetchMember(user).then(member => {
    if (member.nickname) {
      return member.nickname;
    }

    return member.user.username;
  });
}

function hasRole(guild, user, roleName) {
  return guild.members.find('id', user.id).roles.array().some(role => role.name === roleName);
}

module.exports = {
  getOwnedGuilds,
  getGuildsWithAdmin,
  getUser,
  getNickname,
  hasRole,
};
