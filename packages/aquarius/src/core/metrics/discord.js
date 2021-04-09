import { isGuildAdmin } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import dateFns from 'date-fns';
import aquarius from '../../aquarius';
import { ONE_DAY } from '../helpers/times';
import getLogger from '../logging/log';

// CJS / ESM compatibility
const { startOfTomorrow } = dateFns;

const log = getLogger('Discord Metrics');

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
    .size;
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

export async function saveSnapshot() {
  const snapshot = {
    userCount: getTotalUserCount(),
    guildCount: getTotalGuildCount(),
    subscriberCount: getTotalSubscriberCount(),
    channelCount: getTotalChannelCount(),
    adminCount: getTotalAdminCount(),
    specialGuildCount: getSpecialGuildCount(),
    enabledCommands: await aquarius.database.enabledCommand.count(),
  };

  try {
    await aquarius.database.snapshot.create({
      data: {
        snapshot,
      },
    });
  } catch (error) {
    log.error(error.message);
    Sentry.captureException(error);
  }
}

export async function setupDailySnapshotLoop() {
  log.info('Registering Metric Tracking');

  setTimeout(() => {
    saveSnapshot();

    // Set it to run once a day
    setInterval(saveSnapshot, ONE_DAY);
  }, startOfTomorrow() - new Date());
}
