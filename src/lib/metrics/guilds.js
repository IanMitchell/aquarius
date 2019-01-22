import debug from 'debug';
import aquarius from '../..';
import { ONE_WEEK } from '../helpers/times';

const log = debug('GuildMetrics');

// TODO: Implement
export function saveSnapshot(guild) {
  console.log(guild);
}
// TODO: Implement
export function saveSnapshots() {
  log('Saving snapshots');
  aquarius.guilds.forEach(guild => saveSnapshot(guild));
}

// TODO: Implement
export function getTrends(guildId) {

}

// TODO: Document
export async function getGuildMetrics() {
  const guilds = aquarius.guilds.map(async (guild) => {
    const snapshot = await aquarius.database.guildSnapshots
      .findAsCursor({ guildId: guild.id })
      .sort({ date: -1 })
      .limit(5);

    return {
      name: guild.name,
      members: {
        online: 0,
        offline: 0,
        bots: 0,
        total: 0,
      },
      triggers: snapshot.triggers,
      popular: 'N/A',
    };
  });

  return Promise.all(guilds);
}

export async function setupWeeklyGuildLoop() {
  log('Registering Metric Tracking');

  // TODO: Load from settings the last weekly snapshot
  const lastSnapshot = null;
  const target = lastSnapshot.timestamp + ONE_WEEK - Date.now();

  setTimeout(() => {
    saveSnapshots();
    setInterval(saveSnapshots, ONE_WEEK);
  }, target);
}

export function getTotalGuildCount() {
  return aquarius.guilds.size;
}
