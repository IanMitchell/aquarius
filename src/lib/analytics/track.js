import debug from 'debug';
import database from '../database';

const log = debug('Analytics');

// TODO: Document
export default async function track(category, label, action, context) {
  log(`Tracking ${category}>${label}>${action}`);

  return database.analytics.insert({
    category,
    label,
    action,
    context,
    date: new Date(),
  });
}
