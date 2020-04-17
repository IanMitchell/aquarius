# @aquarius/users

Provides several helper methods for working with discord.js users.

## Usage

Install:

```
npm i @aquarius/users
```

## API

### getNickname

Gets the nickname for a User in a Guild. If the user doesn't have one, it returns their regular name.

**Example**

```javascript
import Discord from 'discord.js';
import { getNickname } from '@aquarius/users';

const client = new Discord.Client();

client.on('message', (message) => {
  const nickname = getNickname(message.guild, message.author);
  message.reply(`Thanks for sending a message ${nickname}!`);
});
```

### isBot

Determines if a user is a bot or not.

**Example**

```javascript
import Discord from 'discord.js';
import { isBot } from '@aquarius/users';

const client = new Discord.Client();

client.on('message', (message) => {
  if (isBot(message.author)) {
    message.reply('You are a bot!');
  }
});
```

### isStreaming

Determines if a user is streaming or not. Note that this takes a presence and not a user object; this allows it to check against previous presences and not just the current one.

**Example**

```javascript
import Discord from 'discord.js';
import { isStreaming } from '@aquarius/users';

const client = new Discord.Client();

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!isStreaming(oldPresence) && isStreaming(newPresence)) {
    console.log(`${oldPresence.user} is now streaming!`);
  }
});
```
