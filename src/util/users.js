const aquarius = require('../client');

const getUser = (id) => aquarius.users.get('id', id);

const getNickname = (server, user) => {
  if (typeof user === 'string') {
    return server.detailsOf(getUser(user)).nick || getUser(user).name;
  }

  return server.detailsOf(user).nick || user.name;
};

module.exports = {
  getUser,
  getNickname,
};
