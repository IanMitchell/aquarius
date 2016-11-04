function messageMock(msg) {
  return {
    content: msg,
    cleanContent: msg,
    author: {
      bot: false,
    },
    guild: '91318657375825920',
    mentions: [],
    channel: {
      sendMessage: jest.fn(),
    },
  };
}

function clientMock() {
  return {
    user: '@Aquarius#6102',
    on: jest.fn(),
  };
}

module.exports = {
  messageMock,
  clientMock,
};
