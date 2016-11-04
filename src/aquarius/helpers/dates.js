const moment = require('moment');

function pluralize(val, str) {
  if (val > 1) {
    return str;
  }

  return str.slice(0, -1);
}

function exactDate(date, prefix = false) {
  const now = moment();
  let positive = true;
  let str = '';

  ['years', 'months', 'days', 'hours', 'minutes'].forEach(metric => {
    const val = now.diff(date, metric);

    if (val < 0) {
      now.subtract(val, metric);
      str += `${val * -1} ${pluralize(val * -1, metric)} `;
    } else if (val > 0) {
      now.add(val, metric);
      str += `${val} ${pluralize(val, metric)} `;
      positive = false;
    }
  });

  if (prefix && positive) {
    str = `in ${str}`;
    str = str.substring(0, str.length - 1);
  } else if (prefix) {
    str += 'ago';
  } else {
    str = str.substring(0, str.length - 1);
  }

  if (str === '') {
    str = 'Now';
  }

  return str;
}

module.exports = {
  exactDate,
};
