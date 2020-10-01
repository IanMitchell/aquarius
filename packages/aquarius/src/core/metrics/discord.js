import { isGuildAdmin } from '@aquarius-bot/permissions';
import dateFns from 'date-fns';
import debug from 'debug';
import aquarius from '../../aquarius';
import { ONE_DAY } from '../helpers/times';

// CJS / ESM compatibility
const { startOfTomorrow } = dateFns;

const log = debug('Discord Metric');

export function getTotalUserCount() {
  return aquarius.guilds.cache.reduce(
    (count, guild) => count + guild.memberCount,
    0
  );
}

export function getTotalGuildCount() {
  return aquarius.guilds.cache.size;
}

export function getTotalChannelCount() {
  return aquarius.guilds.cache.reduce(
    (sum, guild) => sum + guild.channels.cache.size,
    0
  );
}

export function getTotalAdminCount() {
  return aquarius.guilds.cache.filter((guild) => isGuildAdmin(guild, guild.me))
    .length;
}

export function getTotalSubscriberCount() {
  return aquarius.guilds.cache.reduce(
    (sum, guild) => sum + guild.premiumSubscriptionCount,
    0
  );
}

export function getSpecialGuildCount() {
  return aquarius.guilds.cache.reduce(
    (sum, guild) => sum + (guild.verified ? 1 : 0),
    0
  );
}

export function saveSnapshot() {
  const snapshot = {
    userCount: getTotalUserCount(),
    guildCount: getTotalGuildCount(),
    subscriberCount: getTotalSubscriberCount(),
    channelCount: getTotalChannelCount(),
    adminCount: getTotalAdminCount(),
    specialGuildCount: getSpecialGuildCount(),
    enabledCommands: aquarius.database.enabledCommand.count(),
  };

  aquarius.database.snapshot.create({
    data: {
      snapshot,
    },
  });
}

export async function setupDailySnapshotLoop() {
  log('Registering Metric Tracking');

  setTimeout(() => {
    saveSnapshot();

    // Set it to run once a day
    setInterval(saveSnapshot, ONE_DAY);
  }, startOfTomorrow() - new Date());
}
