import test from 'ava';
import link from '../../src/util/links';

test('botLink', t => {
  const output = link.botLink();
  t.is(output, 'https://discordapp.com/oauth2/authorize?client_id=185450126549057536&scope=bot&permissions=0');
});

test('repoLink', t => {
  const output = link.repoLink();
  t.is(output, 'http://github.com/ianmitchell/aquarius');
});
