require('../../src/aquarius/prototypes/array');
const Mocks = require('../helpers/mocks');

jest.mock('../../src/aquarius/core/client', () => Mocks.clientMock());
const Order = require('../../src/commands/order');


describe('Order', () => {
  describe('Triggers', () => {
    it('should respond to .o trigger', () => {
      const mock = Mocks.messageMock('.o this, that');
      Order.message(mock);
      expect(mock.channel.sendMessage).toHaveBeenCalled();
    });

    it('should respond to .order trigger', () => {
      const mock = Mocks.messageMock('.order one, two');
      Order.message(mock);
      expect(mock.channel.sendMessage).toHaveBeenCalled();
    });

    it('should not respond to .orde trigger', () => {
      const mock = Mocks.messageMock('.orde one, two');
      Order.message(mock);
      expect(mock.channel.sendMessage).not.toHaveBeenCalled();
    });

    it('should activate in beginning of phrase', () => {
      const mock = Mocks.messageMock('.o this, that');
      Order.message(mock);
      expect(mock.channel.sendMessage).toHaveBeenCalled();
    });

    it('should not activate in middle of phrase', () => {
      const mock = Mocks.messageMock('test .o this, that');
      Order.message(mock);
      expect(mock.channel.sendMessage).not.toHaveBeenCalled();
    });

    it('should not activate with an empty list', () => {
      const mock = Mocks.messageMock('.o');
      Order.message(mock);
      expect(mock.channel.sendMessage).not.toHaveBeenCalled();
    });

    // it('should activate with a list of commas', () => {
    //   const outputs = [
    //     [',,, ,,, ,'],
    //     [',, ,,, ,,'],
    //     [',,, ,, ,,'],
    //   ];
    //
    //   // order.message('Mocha', '#test', '.o ,, , ,,');
    //   // assert(outputs.includes(client.lastMessage), 'Output not found in valid list');
    //
    //   const mock = Mocks.messageMock('.o ,, , ,,');
    //   Order.message(mock);
    //   expect(mock.channel.sendMessage.mock.calls).toContain(outputs);
    // });

    it('should activate with a single comma', () => {
      const mock = Mocks.messageMock('.o ,');
      Order.message(mock);
      expect(mock.channel.sendMessage).toHaveBeenCalledWith(',');
    });

    it('should be case insensitive', () => {
      const mock = Mocks.messageMock('.ORDER A');
      Order.message(mock);
      expect(mock.channel.sendMessage).toHaveBeenCalledWith('A');
    });
  });

  describe('Range', () => {
    it('should choose from within range', () => {
      const lowerBound = 0;
      const upperBound = 10;
      const range = `${lowerBound}-${upperBound}`;

      const mock = Mocks.messageMock(`.o ${range}`);
      Order.message(mock);
      const message = mock.channel.sendMessage.mock.calls[0];
      message[0].split(', ').forEach(val => {
        expect(parseFloat(val)).toBeGreaterThanOrEqual(lowerBound);
        expect(parseFloat(val)).toBeLessThanOrEqual(upperBound);
      });
    });

    // it('should handle reverse ranges', () => {
    //   const expected = [
    //     'Mocha: 5, 6',
    //     'Mocha: 6, 5',
    //   ];
    //
    //   const mock = Mocks.messageMock('.o 6-5');
    //   Order.message(mock);
    //   expect(mock.channel.sendMessage.mock.calls).toContain(expected);
    //
    //   // order.message('Mocha', '#test', '.o 6-5');
    //   // assert(expected.includes(client.lastMessage), 'Output not found in valid list');
    // });

  //   it('should handle negative ranges', () => {
  //     const expected = [
  //       'Mocha: -5, -6',
  //       'Mocha: -6, -5',
  //     ];
  //
  //     order.message('Mocha', '#test', '.o -5--6');
  //     assert(expected.includes(client.lastMessage), 'Output not found in valid list');
  //   });
  //
    it('should include lower and upper bounds', () => {
      const lowerBound = 0;
      const upperBound = 5;
      const range = `${lowerBound}-${upperBound}`;


      const mock = Mocks.messageMock(`.o ${range}`);
      Order.message(mock);
      const values = mock.channel.sendMessage.mock.calls[0][0]
                      .split(', ')
                      .map(val => parseInt(val, 10));

      expect(values).toContain(lowerBound);
      expect(values).toContain(upperBound);
    });

    it('should only include a max of 20 items', () => {
      const mock = Mocks.messageMock('.o 1-25');
      Order.message(mock);

      const vals = mock.channel.sendMessage.mock.calls[0][0].split(', ');
      expect(vals.length).toBe(21);
      expect(vals).toContain('and some more...');
    });

    it('should cap range at 1024', () => {
      const mock = Mocks.messageMock('.o 1-2048');
      Order.message(mock);

      const vals = mock.channel.sendMessage.mock.calls[0][0]
                    .replace(', and some more...', '')
                    .split(', ')
                    .map(val => parseInt(val, 10));

      vals.forEach(val => expect(val).toBeLessThanOrEqual(1024));
    });

    // The torchlight test
    it('should handle large numbers', () => {
      const val = 9007199254740992;
      const mock = Mocks.messageMock(`.o ${val}-${val + 2}`);
      Order.message(mock);

      expect(mock.channel.sendMessage.mock.calls[0][0]).toBe('Value is too high.');
    });
  });

  describe('List', () => {
  //   it('should choose from within list', () => {
  //     const expected = [
  //       'Mocha: a, b c, d',
  //       'Mocha: a, d, b c',
  //       'Mocha: b c, a, d',
  //       'Mocha: b c, d, a',
  //       'Mocha: d, a, b c',
  //       'Mocha: d, b c, a',
  //     ];
  //
  //     order.message('Mocha', '#test', '.o a, b c, d');
  //     assert(expected.includes(client.lastMessage), 'Value not in expected list');
  //   });
  //
  //   it('should randomize results', () => {
  //     const expected = [
  //       'Mocha: a, b, c',
  //       'Mocha: a, c, b',
  //       'Mocha: b, a, c',
  //       'Mocha: b, c, a',
  //       'Mocha: c, a, b',
  //       'Mocha: c, b, a',
  //     ];
  //
  //     const results = new Array();
  //     let runs = 10;
  //
  //     for (let i = 0; i < runs; i++) {
  //       order.message('Mocha', '#test', '.o a b c');
  //       assert(expected.includes(client.lastMessage), 'Value not in expected list');
  //       results.push(client.lastMessage);
  //
  //       // Still can fail, but has a [(0.167^20) * 100]% chance of it
  //       if (i === 9 && results.uniq().length === 1) {
  //         runs *= 2;
  //       }
  //     }
  //
  //     assert(results.uniq().length > 1, 'Results not randomized (possible)');
  //   });
  });
});
