// import test from 'ava';
// import proxyquire from 'proxyquire';
// import { botMention } from '../helpers/mentions';
//
// const clientStub = require('../helpers/client-stub').client;
// const triggerStub = proxyquire('../../src/util/triggers', { '../client': clientStub });
// const eightball = proxyquire('../../src/commands/8ball', { '../util/triggers.js': triggerStub });
//
//
// test.beforeEach(t => {
//   t.context.data = require('../fixtures/message');
// });
//
// test('It should trigger correctly', t => {
//   const msg = t.context.data;
//
//   msg.content = `${botMention()} 8ball this is a mention test`;
//   let response = eightball.message(msg);
//   t.truthy(response, 'Did not respond to valid mention trigger');
//
//   msg.content = '.8ball this is a dot test';
//   response = eightball.message(msg);
//   t.truthy(response, 'Did not respond to valid dot trigger');
//
//   msg.content = '!8ball this is an exclamation mark test';
//   response = eightball.message(msg);
//   t.truthy(response, 'Did not respond to valid exclamation mark trigger');
//
//   msg.content = `${botMention()} 8ball`;
//   response = eightball.message(msg);
//   t.falsy(response, 'Responded to invalid 8ball trigger');
//
//   msg.content = '8ball this is a test';
//   response = eightball.message(msg);
//   t.falsy(response, 'Responded to invalid 8ball trigger');
//
//   msg.content = 'Random message';
//   response = eightball.message(msg);
//   t.falsy(response, 'Responded to invalid message');
// });
//
// test('It should choose from all the options', t => {
//   const msg = t.context.data;
//   msg.content = '.8ball will you generate all responses?';
//   const responses = new Map();
//
//   for (let i = 0; i < 200; i++) {
//     responses.set(eightball.message(msg), true);
//   }
//
//   t.is(responses.size, 20, `Only ${responses.size} responses given`);
// });
