// Aquarius Core Framework
const Admin = require('./admin/admin');
const Client = require('./core/client');
const Command = require('./core/command');
const Triggers = require('./core/triggers');
const Loading = require('./core/loading');
const Permissions = require('./core/permissions');
const Users = require('./core/users');
const Settings = require('./settings/settings');
const Links = require('./helpers/links');
const Dashboard = require('./dashboard/dashboard');
const Dates = require('./helpers/dates');
const Sequelize = require('./database/sequelize');

// Prototypes
require('./prototypes/string');
require('./prototypes/array');

module.exports = {
  Admin,
  Client,
  Command,
  Triggers,
  Loading,
  Permissions,
  Users,
  Settings,
  Links,
  Dashboard,
  Dates,
  Sequelize,
};
