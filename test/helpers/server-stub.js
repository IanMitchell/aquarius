const UserStub = require('./user-stub');
const ClientStub = require('./client-stub');

class ServerStub {
  constructor(id = '123') {
    this.id = id;
    this.owner = new UserStub(0);
    this.roles = [];
    this.users = [];
    this.users.push(this.owner);
    this.users.push(ClientStub.user);
  }

  rolesOfUser(user) {
    return this.roles.filter(role => role.user === user);
  }

  detailsOf(user) {
    return this.users[this.users.indexOf(user)];
  }
}

module.exports = ServerStub;
