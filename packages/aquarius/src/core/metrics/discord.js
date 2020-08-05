import aquarius from '../../aquarius';

export function getTotalUserCount() {
  return aquarius.guilds.cache.reduce(
    (count, guild) => count + guild.memberCount,
    0
  );
}

export function getTotalGuildCount() {
  return aquarius.guilds.cache.size;
}

export function getTotalChannelCount() {}

export function getTotalAdminCount() {}

export function getSpecialGuildCount() {}

export function saveSnapshot() {
  const data = {
    userCount: getTotalUserCount(),
    guildCount: getTotalGuildCount(),
    channelCount: getTotalChannelCount(),
    adminCount: getTotalAdminCount(),
    specialGuildCount: getSpecialGuildCount(),
  };
}

export async function setupDailySnapshotLoop() {
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
