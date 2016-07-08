const UserStub = require('./user-stub');

class ClientStub {
  constructor() {
    this.user = new UserStub('123456789', 'Aquarius');
  }
}

module.exports = new ClientStub();
