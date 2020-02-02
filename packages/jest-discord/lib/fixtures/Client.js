"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientFixture = undefined;
exports.getClientFixture = getClientFixture;

var _events = require("events");

class ClientFixture extends _events.EventEmitter {}

exports.ClientFixture = ClientFixture;

function getClientFixture() {
  return new ClientFixture();
}