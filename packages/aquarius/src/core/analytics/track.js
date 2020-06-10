import Prisma from '@prisma/client';
import debug from 'debug';

const log = debug('Analytics');

// CJS / ESM compatibility
const client = new Prisma.PrismaClient();

/**
 * Creates a event record in the Analytics table. Automatically associates a date with the action
 * @param {string} category - Broad overview for the area you're tracking
 * @param {string} label - More specific area of the area you're tracking
 * @param {string} action - Specific action of the area you're tracking
 * @param {Object} context - Additional fields you want to associate with the record
 */
export default async function track(category, label, action, context) {
  log(`Tracking ${category}>${label}>${action}`);

  return client.analytics.create({
    data: {
      category,
      label,
      action,
      context,
    },
  });
}
