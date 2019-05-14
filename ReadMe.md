# Aquarius

Aquarius is a general purpose [Discord](https://discordapp.com/) chat bot. If you would like to add Aquarius to your server, [click here](https://aquarius.sh/link).

###### Aquarius Assistance

If you have questions, concerns, suggestions, or need general assistance, please create an issue, tweet [@IanMitchel1](https://twitter.com/ianmitchel1), or join [Aquarius's Discord Server](http://discord.companyinc.company/).

## Development Guide

Aquarius is a Node.js application that integrates with Firebase Cloud Firestore. It is hosted on Zeit's Now.

### Setup

You'll first need to [create a bot](https://discordapp.com/developers/applications/) and add the bot to a development server.

You'll then need to install v10 or later of [Node.js](https://nodejs.org/en/download/).

Sign up for a Firebase account and create a Cloud Firestore database. To connect to it, create a file named `.keyfile.json` with your Firebase credentials. You can [follow the instructions here](https://cloud.google.com/firestore/docs/quickstart-servers#set_up_authentication) to get the contents of the file.

Finally, create a file named `now-secrets.json` with the following structure:

```json
{
  "@aquarius-env": "development",
  "@aquarius-token": "token",
  "@aquarius-client-id": "id",
  "@aquarius-firebase-keyfile": ".keyfile.json",
  "@aquarius-firebase-project": "database-name"
}
```

<details>
  <summary>
    <strong>Additional Optional Fields</strong>
  </summary>

- `"@aquarius-sentry": "url"` - Integrates with [Sentry](https://sentry.io) error reporting
- `"@aquarius-dictionary-api-key": "key"` - Enables the Dictionary command
- `"@aquarius-test-bot-token": "token"` - Enables the test framework (WIP)
- `"@aquarius-hearthstone-key": "key"` - Enables the Hearthstone command
- `"@aquarius-timber-key": "key"` - Enables logging to [Timber](https://timber.io)
- `"@aquarius-showtimes-server": "url"` - Enables the [Deschtimes](http://github.com/ianmitchell/showtimes) command
- `"@aquarius-showtimes-key": "key"` - Enables the [Deschtimes](http://github.com/ianmitchell/showtimes) command
- `"@aquarius-tvdb-api-key": "key"` - Adds Images to the [Deschtimes](http://github.com/ianmitchell/showtimes) Command
- `"@aquarius-github-api-token": "token"` - Enables the Release command to automatically notify users of updates
- `"@aquarius-dark-sky-api-key": "key"` - Enables the Weather command
- `"@aquarius-mapbox-api-key": "key"` - Enables the Weather command

</details>

---

Once the file is created, run:

    $ yarn install

This will fetch all the dependencies needed to run the bot. You can then start Aquarius by running:

    $ yarn start

The bot will take a few seconds to connect. You can test it by sending `ping` in a channel it can respond in (Aquarius should reply with `pong`).

### Adding New Commands and Plugins

For further information on creating Commands and Plugins check the [Wiki](/wiki).

### Visual Studio Code

The repository is setup to work well with Visual Studio Code. You can add breakpoints and run the "Launch Aquarius" task to start the bot in "Debug" mode. Many of the core APIs also have JSDoc integrations for VS Code's intellisence.
