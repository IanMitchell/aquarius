import { startLoading, stopLoading } from './loading';

const channel = {
  startTyping: jest.fn(),
  stopTyping: jest.fn(),
};

describe('start', () => {
  test('sends typing activity to channel', () => {
    startLoading(channel);
    expect(channel.startTyping).toHaveBeenCalled();
    expect(channel.stopTyping).not.toHaveBeenCalled();
  });
});

describe('stop', () => {
  test('sends stop typing activity to channel', () => {
    stopLoading(channel);
    expect(channel.startTyping).not.toHaveBeenCalled();
    expect(channel.stopTyping).toHaveBeenCalled();
  });
});
