# Aquarius

Aquarius is a general purpose [Discord](https://discordapp.com/) chat bot.

### Adding Aquarius to your Server

[Click here](https://aquarius.sh/link) to add Aquarius to your server.

### Aquarius Assistance

If you have questions, concerns, suggestions, or need general assistance, please create an issue, tweet [@IanMitchel1](https://twitter.com/ianmitchel1), or join [Aquarius's Discord Server](http://discord.companyinc.company/).

## Development Guide

Aquarius is a Node.js application that integrates with Azure Cosmos through the MongoDB API bridge. It is hosted on Zeit's Now.

### Setup

You'll first need to create a development server and bot, and add the bot to your development server. You can do that by creating the following URL:

TODO: Define how to create bot

#### Prerequisites: Windows

_I highly recommend running Aquarius through [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/about). It's untested on native Windows, but I believe it should work._

Install and run the [Cosmos Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator).

#### Prerequisites: macOS and Linux

Install MongoDB.

### Running Aquarius

Aquarius requires version 10 or later of Node.js.

Create a file named `now-secrets.json` with the following structure:

```json
{
  "@aquarius-env": "development",
  "@aquarius-token": "<BOT TOKEN>",
  "@aquarius-client-id": "<BOT CLIENT",
  "@aquarius-mongo": "mongodb://127.0.0.1:27017/aquarius",
  ...
}
```

_**Windows:** Change the `@aquarius-mongo` value to be `mongodb://localhost:C2y6yDjf5%2FR%2Bob0N8A7Cgv30VRDJIWEHLM%2B4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw%2FJw%3D%3D@localhost:10255/aquarius?ssl=true` in order to target the emulator._

<details>
  <summary>
    <strong>Key Descriptions</strong>
  </summary>

  * `@aquarius-env` - Defines the `NODE_ENV`
  * `@aquarius-token` - Discord Token that allows API Access
  *  `@aquarius-client-id` - Discord Client ID for API Integration
  * `@aquarius-mongo` - Database URL to connect to
</details>

---

Once the file is created, run

```
$ yarn install
```

This will fetch all the dependencies needed to run the bot. You can start it with the following command:

```
$ yarn start
```

### Adding New Commands and Plugins

For further information on creating Commands and Plugins check the [Wiki](/wiki).

### Visual Studio Code

The repository is setup to work well with Visual Studio Code. You can add breakpoints and run the "Launch Aquarius" task to start the bot in "Debug" mode. Many of the core APIs also have JSDoc integrations for VS Code's intellisence.
