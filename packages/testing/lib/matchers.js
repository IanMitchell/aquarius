"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMockAquarius = getMockAquarius;
exports.getMatchers = getMatchers;
exports.getHandlers = getHandlers;

// TODO: Move
function getMockAquarius() {
  return {
    onDirectMessage: jest.fn(),
    onCommand: jest.fn(),
    onTrigger: jest.fn()
  };
}

function getMatchers(command, parameters) {
  const bot = getMockAquarius();
  command({
    aquarius: bot,
    ...parameters
  });
  return [...bot.onDirectMessage.mock.calls.map(([regex]) => regex), ...bot.onCommand.mock.calls.map(([regex]) => regex), ...bot.onTrigger.mock.calls.map(([regex]) => regex)];
}

function getHandlers(command, parameters) {
  const bot = getMockAquarius();
  command({
    aquarius: bot,
    ...parameters
  });
  return [...bot.onDirectMessage.mock.calls.map(([, handler]) => handler), ...bot.onCommand.mock.calls.map(([, handler]) => handler), ...bot.onTrigger.mock.calls.map(([, handler]) => handler)];
}