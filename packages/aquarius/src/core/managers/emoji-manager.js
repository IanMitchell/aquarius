import aquarius from '../../aquarius';
import { ONE_HOUR } from '../helpers/times';
import getLogger from '../logging/log';

const log = getLogger('Emoji Manager');

/**
 * Manages custom emoji for Aquarius
 * @extends Map
 */
export default class EmojiManager extends Map {
  /**
   * Registers handlers to run once Aquarius has logged on and
   * loads information on boot.
   */
  initialize() {
    log.info('Creating List');

    this.getList();

    setInterval(() => this.getList(), ONE_HOUR);
  }

  /**
   * Refreshes Map state with uploaded emojis in the Home Guild
   */
  getList() {
    log.info('Refreshing emoji list');

    const homeGuild = aquarius.guilds.cache.get(aquarius.config.home.guild);

    if (!homeGuild) {
      log.error(
        'Aquarius is not a member of the Home Server defined in `config.yml`'
      );
      return;
    }

    homeGuild.emojis.cache
      .filter((emoji) => emoji.name.startsWith('aquarius'))
      .array()
      .forEach((emoji) => this.set(emoji.name.replace(/aquarius_/, ''), emoji));
  }
}
