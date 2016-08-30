import test from 'ava';
import stringUtil from '../../src/util/string';

test('capitalize', t => {
  let output = stringUtil.capitalize('test');
  t.is(output, 'Test');

  output = stringUtil.capitalize('.8ball test');
  t.is(output, '.8ball test');

  output = stringUtil.capitalize('four score');
  t.is(output, 'Four score');
});
