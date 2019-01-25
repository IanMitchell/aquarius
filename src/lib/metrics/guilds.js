import debug from 'debug';
import aquarius from '../..';
import { ONE_WEEK, ONE_HOUR } from '../helpers/times';
import { startOfWeek } from 'date-fns/esm';

const log = debug('Guild Metrics');

export async function saveSnapshots() {
  log('Saving snapshots');

  // FIXME: Cosmos
  const bulk = aquarius.database.guildSnapshots.initializeOrderedBulkOp();

  aquarius.guilds.forEach(guild => {
    bulk.insert({
      channels: guild.channels.size,
      users: guild.members.size,
      bots: guild.members.filter(member => member.user.bot).size,
      date: Date.now(),
      guildId: guild.id,
      name: guild.name,
      icon: guild.iconURL,
      ownerId: guild.ownerID,
      vip: !!guild.splash,
      verified: guild.verified,
      admin: aquarius.permissions.isGuildAdmin(guild, guild.me),
    });
  });

  return bulk.execute();
}

// TODO: Implement
export function getTrends(guildId) {

}

// TODO: Document
export async function getGuildMetrics() {
  const guilds = aquarius.guilds.map(async (guild) => {
    // FIXME: Cosmos
    const snapshot = await aquarius.database.guildSnapshots
      .findAsCursor({ guildId: guild.id })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

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

  // Retrieve the last time we updated
  const [lastSnapshot] = await aquarius.database.guildSnapshots.findAsCursor()
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  let target = 0;

  if (lastSnapshot) {
    // We want to target 1:00 on Sunday of the next week
    target = startOfWeek(new Date(lastSnapshot.date + ONE_WEEK)).getTime() + ONE_HOUR;
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
      (ONE_WEEK + ONE_HOUR) - (Date.now() - startOfWeek(new Date()).getTime())
    );
  }, target - Date.now());
}

export function getTotalGuildCount() {
  return aquarius.guilds.size;
}
