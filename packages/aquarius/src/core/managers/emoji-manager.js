import chalk from 'chalk';
import debug from 'debug';
import aquarius from '../../aquarius';
import { TEN_MINUTES } from '../helpers/times';

const log = debug('Emoji Manager');

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
    log('Creating List');

    this.getList();

    setInterval(() => this.getList(), TEN_MINUTES);
  }

  /**
   * Refreshes Map state with uploaded emojis in the Home Guild
   */
  getList() {
    log('Refreshing emoji list');

    const homeGuild = aquarius.guilds.cache.get(aquarius.config.home.guild);

    if (!homeGuild) {
      log(
        chalk.redBright(
          'ERROR: Aquarius is not a member of the Home Server defined in `config.yml`'
        )
      );
      return;
    }

    homeGuild.emojis.cache
      .filter((emoji) => emoji.name.startsWith('aquarius'))
      .array()
      .forEach((emoji) => this.set(emoji.name.replace(/aquarius_/, ''), emoji));
  }
}
