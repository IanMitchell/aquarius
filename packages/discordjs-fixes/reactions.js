/**
 * This file exists to fix decisions made by discord.js.
 */

const PARTIAL_EVENTS = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

export function fixPartialReactionEvents(client, v12 = false) {
  // See: https://gist.github.com/Danktuary/27b3cef7ef6c42e2d3f5aff4779db8ba
  client.on('raw', async (event) => {
    // `event.t` is the raw event name
    if (!Object.prototype.hasOwnProperty.call(PARTIAL_EVENTS, event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel =
      client.channels.get(data.channel_id) || (await user.createDM());

    // if the message is already in the cache, don't re-emit the event
    if (channel.messages.has(data.message_id)) return;

    // if you're on the master/v12 branch, use `channel.messages.fetch()`
    const message = await (v12
      ? channel.messages.fetch(data.message_id)
      : channel.fetchMessage(data.message_id));

    // custom emojis reactions are keyed in a `name:ID` format, while unicode emojis are keyed by names
    // if you're on the master/v12 branch, custom emojis reactions are keyed by their ID
    const emojiKey = data.emoji.id
      ? `${data.emoji.name}:${data.emoji.id}`
      : data.emoji.name;
    const reaction = message.reactions.get(v12 ? data.emoji.id : emojiKey);

    client.emit(PARTIAL_EVENTS[event.t], reaction, user);
  });
}
