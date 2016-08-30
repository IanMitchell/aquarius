import test from 'ava';
import DefaultKey from '../../../src/core/classes/default-key';

test('sets the values', t => {
  const key = new DefaultKey('value', 'description');

  t.is(key.value, 'value');
  t.is(key.description, 'description');
});
