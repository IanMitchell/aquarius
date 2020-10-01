import debug from 'debug';
import database from '../database/database';

const log = debug('Analytics');

/**
 * Creates a event record in the Analytics table. Automatically associates a date with the action
 * @param {string} category - Broad overview for the area you're tracking
 * @param {string} label - More specific area of the area you're tracking
 * @param {string} action - Specific action of the area you're tracking
 * @param {Object} context - Additional fields you want to associate with the record
 */
export default async function track(category, label, action, context) {
  log(`Tracking ${category}>${label}>${action}`);

  return database.analytic.create({
    data: {
      category,
      label,
      action,
      context,
    },
  });
}
