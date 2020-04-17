# @aquarius/discordjs-fixes

A library of fixes for the discord.js library. I did not write these; the authors are given credit in the source code and below.

## Fixing Reactions

_Credit: [Danktuary](https://gist.github.com/Danktuary/27b3cef7ef6c42e2d3f5aff4779db8ba)_

When a discord.js client starts up it only subscribes to Reactions on messages sent while it has been online. Messages sent from before that timestamp don't trigger a reaction add/remove event. This method patches that functionality in, so that every reaction event triggers the event.

**Usage**

```javascript
import { fixPartialReactionEvents } from '@aquarius/discordjs-fixes';

const client = new Discord.Client();
fixPartialReactionEvents(client);
```
