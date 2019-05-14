module.exports = {
  webpack(config) {
    return {
      ...config,

      // This plugin is incredibly dumb.
      plugins: config.plugins.filter(
        plugin => plugin.constructor.name !== 'FriendlyErrorsWebpackPlugin'
      ),
    };
  },
};
