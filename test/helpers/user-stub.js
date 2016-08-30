class UserStub {
  constructor(id = '0', name = 'N/A') {
    this.id = id;
    this.name = name;
    this.nick = null;
  }

  equals(user) {
    return this.id === user.id;
  }
}

module.exports = UserStub;
