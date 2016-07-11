class CacheStub {
  add(param) {
    return param;
  }
}

class ClientStub {
  constructor() {
    this.channels = new CacheStub();
    this.users = new CacheStub();
    this.internal = this;
  }
}

module.exports = new ClientStub();
