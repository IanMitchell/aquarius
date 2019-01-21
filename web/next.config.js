module.exports = {
  webpack(config) {
    // This plugin is incredibly dumb.
    config.plugins = config.plugins.filter(plugin =>
      plugin.constructor.name !== 'FriendlyErrorsWebpackPlugin');

    return config;
  }
}
