function formatBytes(size, binary = false) {
  if (size === 0 || typeof size !== 'number') {
    return '0 B';
  }

  const div = binary ? 1024 : 1000;

  const i = Math.floor(Math.log(size) / Math.log(div));
  const type = ['B', 'kB', 'MB', 'GB', 'TB'];
  const converted = (size / Math.pow(div, i)).toFixed(2) * 1;
  return `${converted} ${type[i]}`;
}

module.exports = {
  formatBytes,
};
