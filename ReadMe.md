# Aquarius

[![Greenkeeper badge](https://badges.greenkeeper.io/IanMitchell/aquarius.svg)](https://greenkeeper.io/)

Note: Currently being rewritten in a private repo (and has been for the past year...). The tasks and milestones in this project reflect the progress of the rewrite, not of the current codebase.

__*If you run a Discord server and would like the bot, [click here to add it!](https://discordapp.com/oauth2/authorize?client_id=176793254350684160&scope=bot&permissions=0)*__

A highly configurable [Discord](https://discordapp.com/) bot. [ARX-7's](https://github.com/IanMitchell/ARX-7) younger sibling.


## Development Guide

#### Setup

If you'd like to get a local version of Aquarius up and running, you'll need to do the following:

1. Install PostgreSQL
2. Install Node.js (v6+)
3. Register a bot user on discord (https://discordapp.com/developers/applications/me)
4. Add the bot to your server
5. Create a `.env` file

Note when you're creating the Discord bot you'll need to convert your bot to a App Bot User account - it will warn you about the process being irreversible when you do this.

Once you have PostgreSQL installed, create a `aquarius_dev` database. You'll need to add the connection string to the `.env` file.

The `.env` file should look like the following:

```
TOKEN=[Discord "Token"]
CLIENT_ID=[Discord "Client/Application ID"]
OWNER_ID=[Your Discord User ID]
DATABASE_URL=postgresql://ianm@localhost/aquarius_dev
```

The bot should work across all OS environments and is controlled via the following npm scripts.

1. `$ npm start` Starts the bot.
2. `$ npm test` Runs the test suite.

#### Adding a new Command

Adding new commands is detailed in the wiki.

#### Adding Database Tables

We use Sequelize and the Sequelize CLI. To generate a table, you can run

```
$ node_modules/.bin/sequelize model:create --config ./.sequelizerc --name quotes --attributes name:string,quote:text
```

To migrate the changes, you can run

```
$ node_modules/.bin/sequelize db:migrate --config ./.sequelizerc
```

#### Enabling Commands

By default all commands are disabled. To enable a command, DM the bot and tell it

```
add <command_name>
```

To enable all commands, run

```
add all
```

Disable commands by using remove instead of add
