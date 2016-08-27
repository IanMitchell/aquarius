function formatBytes(size) {
  if (size === 0) {
    return '0 B';
  }

  const i = Math.floor(Math.log(size) / Math.log(1024));
  const type = ['B', 'kB', 'MB', 'GB', 'TB'];
  const converted = (size / Math.pow(1024, i)).toFixed(2) * 1;
  return `${converted} ${type[i]}`;
}

module.exports = {
  formatBytes,
};
