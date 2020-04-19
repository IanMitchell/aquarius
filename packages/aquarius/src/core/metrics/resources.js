import dateFns from 'date-fns';
import os from 'os';
import prettyBytes from 'pretty-bytes';
import aquarius from '../../aquarius';

// CJS / ESM compatibility
const { formatDistance } = dateFns;

function getStats() {
  let totalIdle = 0;
  let total = 0;

  os.cpus().forEach((cpu) => {
    // eslint-disable-next-line object-curly-newline
    const { user, nice, sys, irq, idle } = cpu.times;

    total += user + nice + sys + irq + idle;
    totalIdle += idle;
  });

  return {
    total,
    idle: totalIdle,
  };
}

function getUsage() {
  const initial = getStats();

  return new Promise((resolve) =>
    setTimeout(() => {
      const final = getStats();

      const idle = final.idle - initial.idle;
      const total = final.total - initial.total;

      resolve(((1 - idle / total) * 100).toFixed(2));
    }, 1000)
  );
}

// TODO: Document
export async function getResourceUsage() {
  const cpu = await getUsage();
  return {
    cpu: `${cpu}%`,
    memory: prettyBytes(process.memoryUsage().heapUsed),
    uptime: formatDistance(new Date(), Date.now() - aquarius.uptime),
  };
}
