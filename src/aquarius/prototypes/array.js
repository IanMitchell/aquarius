Array.prototype.uniq = function() {
  return [...new Set(this)];
};
