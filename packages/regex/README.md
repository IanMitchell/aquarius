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
