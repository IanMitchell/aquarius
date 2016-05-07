# Aquarius

A discord bot. [ARX-7's](https://github.com/IanMitchell/ARX-7) younger sibling.


## I want it!

It's still a little premature to add to most servers. If you really want to though, [click here](https://discordapp.com/oauth2/authorize?client_id=176793254350684160&scope=bot&permissions=0
) to add the bot to your server. Aquarius isn't hosted yet, so it'll only be online when I'm running it locally.

## New Commands

Drop them into the `src/commands` folder and follow this format:

```
exports.command = {
  name: 'command',
  help: 'this string is my help message',
  message: func(message) // Returns string response, or false if no response 
}
```
