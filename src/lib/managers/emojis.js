import debug from 'debug';
import chalk from 'chalk';
import aquarius from '../../aquarius';
import { TEN_MINUTES } from '../helpers/times';

const log = debug('Emoji Manager');

/**
 * Manages custom emoji for Aquarius
 */
export default class EmojiManager extends Map {
  initialize() {
    log('Creating List');

    this.getList();

    setInterval(() => this.getList(), TEN_MINUTES);
  }

  getList() {
    log('Refreshing emoji list');

    const homeGuild = aquarius.guilds.get(aquarius.config.home.guild);

    if (!homeGuild) {
      log(
        chalk.redBright(
          'ERROR: Aquarius is not a member of the Home Server defined in `config.yml`'
        )
      );
      return;
    }

    homeGuild.emojis
      .filter(emoji => emoji.name.startsWith('aquarius'))
      .array()
      .forEach(emoji => this.set(emoji.name.replace(/aquarius_/, ''), emoji));
  }
}
