# @aquarius/regex

Regex helpers for matching with Discord message structures.

## Available Patterns

- MENTION
- MENTION_USER
- MENTION_USER_ID
- MENTION_USER_NICKNAME
- MENTION_CHANNEL
- MENTION_ROLE
- EMOJI
- CUSTOM_EMOJI
- ANIMATED_EMOJI
- BRACKET (matches [[Card]] syntax)

## Available Helpers

This package also includes some additional helpers when working with mentions. If you're trying to determine what kind of mention a references is, you can call `getMentionType` with the message to return the type of mention. The options are defined in the `MENTION_TYPES` enum.

For instance, given a list of mentions you might use the following to map them to actual objects:

```javascript
mentions.map((mention) => {
  switch (getMentionType(mention[0])) {
    case MENTION_TYPES.USER:
      return message.guild.members.fetch(mention.groups.id);
    case MENTION_TYPES.CHANNEL:
      return message.guild.channels.cache.get(mention.groups.id);
    case MENTION_TYPES.ROLE:
      return message.guild.roles.fetch(mention.groups.id);
    default:
      return null;
  }
});
```

## Combining Patterns

Say you want to match a message that looks like this -

```
Assign @user @role
```

You would could combine the patterns like this:

```javascript
import { MENTION_USER, MENTION_ROLE } from '@aquarius/regex';

const pattern = new RegExp(
  `Assign ${MENTION_USER.source} ${MENTION_ROLE.source}`
);
```
