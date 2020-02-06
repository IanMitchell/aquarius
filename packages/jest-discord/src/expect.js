import toBeEmbed from './assertions/toBeEmbed';
import toBeMessage from './assertions/toBeMessage';
import toHaveEmbed from './assertions/toHaveEmbed';

expect.extend({
  toBeEmbed,
  toBeMessage,
  toHaveEmbed,
});
