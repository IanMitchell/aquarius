import { isGuildAdmin } from '@aquarius-bot/permissions';
import dateFns from 'date-fns';
import debug from 'debug';
import aquarius from '../../aquarius';
import { ONE_HOUR, ONE_WEEK } from '../helpers/times';

// CJS/ESM compatibility
const { startOfWeek } = dateFns;

const log = debug('Guild Metrics');

export async function saveSnapshots() {
  log('Saving snapshots');

  const batch = aquarius.database.batch();

  // TODO: Make this in groups of 500 max
  aquarius.guilds.cache.forEach((guild) => {
    const ref = aquarius.database.guildSnapshots.doc();

    batch.set(ref, {
      channels: guild.channels.cache.size,
      users: guild.memberCount,
      bots: guild.members.cache.filter((member) => member.user.bot).size,
      date: Date.now(),
      guildId: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      ownerId: guild.ownerID,
      vip: !!guild.splash,
      verified: guild.verified,
      admin: isGuildAdmin(guild, guild.me),
    });
  });

  return batch.commit();
}

// TODO: Implement
export function getTrends(/* guildId */) {}

// TODO: Document
// export async function getGuildMetrics() {
//   const guilds = aquarius.guilds.map(async (guild) => {
//     const snapshot = await aquarius.database.guildSnapshots
//       .findAsCursor({ guildId: guild.id })
//       .sort({ date: -1 })
//       .limit(5)
//       .toArray();

//     return {
//       name: guild.name,
//       members: {
//         online: 0,
//         offline: 0,
//         bots: 0,
//         total: 0,
//       },
//       triggers: snapshot.triggers,
//       popular: 'N/A',
//     };
//   });

//   return Promise.all(guilds);
// }

export async function setupWeeklyGuildLoop() {
  log('Registering Metric Tracking');

  // Retrieve the last time we updated
  const snapshotList = await aquarius.database.guildSnapshots
    .orderBy('date', 'desc')
    .limit(1)
    .get();

  let target = 0;

  if (!snapshotList.empty) {
    const snapshot = snapshotList.docs[0].data();
    // We want to target 1:00 on Sunday of the next week
    target =
      startOfWeek(new Date(snapshot.date + ONE_WEEK)).getTime() + ONE_HOUR;
  }

  // If we missed it, save immediately and push to next week
  if (target <= Date.now()) {
    await saveSnapshots();
    target = startOfWeek(new Date()).getTime() + ONE_WEEK + ONE_HOUR;
  }

  // Create a loop that looks to further Sundays!
  setTimeout(() => {
    saveSnapshots();
    setInterval(
      saveSnapshots,
      ONE_WEEK + ONE_HOUR - (Date.now() - startOfWeek(new Date()).getTime())
    );
  }, target - Date.now());
}

export function getTotalGuildCount() {
  return aquarius.guilds.cache.size;
}
