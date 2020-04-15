import dedent from 'dedent-js';
import fetch from 'node-fetch';
import aquarius from '../src/aquarius';
import { ONE_MINUTE } from '../src/core/helpers/times';
// import { getGuildMetrics, getTotalGuildCount } from '../src/lib/metrics/guilds';
import { getTotalGuildCount } from '../src/core/metrics/guilds';
import { getResourceUsage } from '../src/core/metrics/resources';
import { getTotalUserCount } from '../src/core/metrics/users';

// TODO: Generate and store metrics via a cron type system

export async function getGitHubInformation() {
  const query = dedent`
    query {
      repository(owner: "ianmitchell", name: "aquarius") {
        stargazers {
          totalCount
        }
        forkCount
        watchers {
          totalCount
        }
        issues(states: OPEN) {
          totalCount
        }
        pullRequests(states: OPEN) {
          totalCount
        }
      }
    }
  `;

  const auth = Buffer.from(`bearer ${process.env.GITHUB_API_TOKEN}`).toString(
    'base64'
  );

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  const { repository } = json.data;

  return {
    stars: repository.stargazers.totalCount,
    forks: repository.forkCount,
    issues: repository.issues.totalCount,
    pullRequests: repository.pullRequests.totalCount,
    watchers: repository.watchers.totalCount,
  };
}

export function getSentryInformation() {
  return {
    trackedBugs: 0,
  };
}

export async function getMetricHandler() {
  // Create Data Structures
  let messagesReceived = 0;
  // let guildMetricCache = await getGuildMetrics();

  aquarius.on('message', () => {
    messagesReceived += 1;
  });

  // Create Update Looks
  setInterval(() => {
    messagesReceived = 0;
  }, ONE_MINUTE);

  // setInterval(async () => {
  //   guildMetricCache = await getGuildMetrics();
  // }, THIRTY_MINUTES);

  // Create Interface
  return {
    // Row 1
    getResourceUsage,
    getMessagesReceived: () => messagesReceived,
    getCurrentUserCount: () => ({
      totalUsers: getTotalUserCount(),
    }),
    getCurrentGuildCount: () => ({
      totalGuilds: getTotalGuildCount(),
    }),

    // Row 2 Table
    // getServerList: () => guildMetricCache,

    // Row 3
    // getWeeklyStats: () => {
    //   return {
    //     servers: 0,
    //     serversDelta: 0,
    //     users: 0,
    //     usersDelta: 0,
    //     activations: 0,
    //     activationsDelta: 0,
    //   };
    // },

    // Row 4
    // getMonthlyCommandInvocations: () => { },
  };
}
