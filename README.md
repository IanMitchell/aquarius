<h1 align="center">A Q U A R I U S</h1>

<p align="center">
  <strong><a href="https://aquarius.sh/link">Click Here to add Aquarius to your server</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/endpoint?url=https://api.aquarius.sh/shield/users">
  <img src="https://img.shields.io/endpoint?url=https://api.aquarius.sh/shield/guilds">
  <img src="https://img.shields.io/endpoint?url=https://api.aquarius.sh/shield/commands">
</p>

---

Aquarius is a general purpose [Discord](https://discordapp.com/) chat bot. If you have questions, concerns, suggestions, or need general assistance, please create an issue, tweet [@IanMitchel1](https://twitter.com/ianmitchel1), or join [Aquarius's Discord Server](http://discord.companyinc.company/).

## Overview

Aquarius is designed to be easy and intuitive to use for both users and new contributors. The goal is to reach feature parity with the mega-bots with much less code complexity. It is fully customizeable, allowing guilds to enable or disable commands in order to make the bot fit their exact needs.

Aquarius is written in Node.js and interacts with many different APIs and Services. It is hosted on Digital Ocean and uses a PostgreSQL database.

## Usage

> For help using Aquarius, visit https://aquarius.sh/docs.

For generic help:

```
@Aquarius help
```

To add a command or plugin:

```
@Aquarius commands add <name>
```

_Aquarius will prompt you with any additional information needed._

## Community

Aquarius development happens on the [Company Inc](http://companyinc.company) Discord Server - it's an active and diverse community that has far-ranging tastes. If you'd like to ask questions about Aquarius, learn more about programming, or have an idea for a new command come talk to us!

[Join our Discord Server!](http://discord.companyinc.company)

## Announcements

Very rarely we'll announce new features or planned downtime in the Discord server linked above. You can [follow to the announcement channel](https://support.discordapp.com/hc/en-us/articles/360028384531-Channel-Following-FAQ) to receive these notifications.

## Development

For help with local development of the bot, check the [Getting Started Wiki Page](https://github.com/IanMitchell/aquarius/wiki/Getting-Started).

If you are working on your own discord bot, Aquarius publishes several different packages that might be of interest.

- [@aquarius-bot/discordjs-fixes](/packages/discordjs-fixes) - A library of fixes for the discord.js library.
- [@aquarius-bot/loading](/packages/loading) - Helper methods to simulate loading on Discord.
- [@aquarius-bot/messages](/packages/messages) - Helper methods for dealing with Message objects.
- [@aquarius-bot/permissions](/packages/permissions) - Helper methods and objects for dealing with Discord permissions.
- [@aquarius-bot/progress-bar](/packages/progress-bar) - A configurable progress bar to display in messages.
- [@aquarius-bot/regex](/packages/regex) - A library of Regex patterns to use on Discord messages.
- [@aquarius-bot/sentry](/packages/sentry) - Wrappers to provide additional metadata in Sentry error reports.
- [@aquarius-bot/triggers](/packages/triggers) - A set of helpers that allow you to look for different bot command activation triggers.
- [@aquarius-bot/users](/packages/users) - Helper methods for dealing with User objects.
- [jest-discord](/packages/jest-discord) - WIP Jest integration.
- [jest-discord-bot](/packages/jest-discord-bot) - WIP Jest integration.
- [jest-discord-fakes](/packages/jest-discord-fakes) - WIP Jest integration.
- [jest-discord-environment](/packages/environment) - WIP Jest integration.
