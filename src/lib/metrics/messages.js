export function getWeeklyUsage(weeksAgo) {
  const startTarget = getDateAgo(ONE_WEEK * weeksAgo);
  const endTarget = getDateAgo(ONE_WEEK * (weeksAgo - 1));

  // FIXME: Cosmos
  return aquarius.database.analytics.count({
    date: {
      $gte: startTarget,
      $lte: endTarget,
    },
  });
}
