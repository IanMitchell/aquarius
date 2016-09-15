function startLoading(channel) {
  return channel.startTyping();
}

function stopLoading(channel) {
  return channel.stopTyping();
}

module.exports = {
  startLoading,
  stopLoading,
};
