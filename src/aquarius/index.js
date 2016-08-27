/*
- Aquarius
  * .Command
  * .Triggers.*
  * .Loading.*
  * .Permissions.*
  * .Users.*
  * .Dashboard.*
  * .Log.*
  * .Sequelize.*

  includes:
    - Prototypes


Goals:
  - Rearrange things to be a little cleaner, clearer distinction between framework and commands
  - Allow most things to just `const Aquarius = require('../core');`
    - Allow for `class Overwatch extends Aquarius.Command` and things like that
  - Create a more robust logging system
    - Logs to dashboard in dev mode, one log stream in production mode
*/

// Aquarius Core Framework
const Client = require('./core/client');
const Command = require('./core/command');
const Triggers = require('./core/triggers');
const Loading = require('./core/loading');
const Permissions = require('./core/permissions');
const Users = require('./core/users');
const Settings = require('./settings/settings');
const Links = require('./helpers/links');
// const Dashboard = require('./dashboard/dashboard');
const Sequelize = require('./database/sequelize');

// Prototypes
require('./prototypes/string');
require('./prototypes/array');

module.exports = {
  Client,
  Command,
  Triggers,
  Loading,
  Permissions,
  Users,
  Settings,
  Links,
  // Dashboard,
  Sequelize,
};
