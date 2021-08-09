import {
  checkBotPermissions,
  getPermissionName,
} from '@aquarius-bot/permissions';
import { getNickname } from '@aquarius-bot/users';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { MessageEmbed, Permissions } from 'discord.js';
import { getGitHubLink, getHost } from '../../core/helpers/links';
import { humanize, setDifference } from '../../core/helpers/lists';
import { capitalize } from '../../core/helpers/strings';
import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Help');

const EMOJI = {
  VALID: ':white_check_mark:',
  INVALID: ':x:',
};

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'help',
  description:
    'Provides information on how to use a command. Need support? See `.support`. Want to invite me to your server? See `.invite`.',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: dedent`
    **View General Help**
    \`\`\`@Aquarius help\`\`\`

    **View Command Specific Help**
    \`\`\`@Aquarius help <command>\`\`\`

    **Instructions on Adding or Removing Commands**
    \`\`\`@Aquarius help admin\`\`\`
  `,
};

export function helpMessage(aquarius, commandInfo, guild) {
  let enabled = false;

  if (guild) {
    enabled = aquarius.guildManager
      .get(guild.id)
      .isCommandEnabled(commandInfo.name);
  }

  const settings = aquarius.commandConfigs.get(commandInfo.name).hasSettings();

  const nickname = getNickname(guild, aquarius.user);

  const embed = new MessageEmbed({
    author: {
      name: 'Aquarius',
      icon_url: aquarius.user.avatarURL({ format: 'png' }),
      url: getHost(),
    },
    title: capitalize(commandInfo.name),
    description: commandInfo.description,
    footer: {
      icon_url: 'https://github.com/fluidicon.png',
      text: getGitHubLink(),
    },
  });

  if (commandInfo.usage) {
    embed.addField('Usage', commandInfo.usage.replace(/Aquarius/g, nickname));
  }

  if (commandInfo.permissions) {
    embed.addField(
      'Permissions',
      commandInfo.permissions.map((permission) => {
        if (guild.me.permissions.has(permission)) {
          return `${EMOJI.VALID} ${getPermissionName(permission)}`;
        }

        return `${EMOJI.INVALID} ${getPermissionName(permission)}`;
      })
    );
  }

  if (commandInfo.global) {
    embed.addField('Global', 'Yes', true);
  } else {
    embed.addField('Enabled', enabled ? 'Yes' : 'No', true);
  }

  embed.addField('Custom Settings', settings ? 'Yes' : 'No', true);

  return embed;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  // Handle generic help
  aquarius.onCommand(/^help$/i, (message) => {
    log.info(
      `Help request in "${chalk.green(message.guild.name)}#${chalk.green(
        message.channel.name
      )}"`,
      getMessageMeta(message)
    );

    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log.warn('Invalid permissions', getMessageMeta(message));
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    const globalList = aquarius.getGlobalCommandNames(false);

    const commandList = Array.from(
      setDifference(
        new Set(aquarius.guildManager.get(message.guild.id).enabledCommands),
        new Set(globalList)
      )
    );

    const disabledCommands = Array.from(
      setDifference(
        new Set(
          Array.from(aquarius.commandList.entries())
            .filter(([, value]) => !value.hidden && !value.global)
            .map(([key]) => key)
        ),
        new Set(commandList)
      )
    );

    const embed = helpMessage(aquarius, info, message.guild);

    embed.addField('Enabled Commands', humanize(commandList.sort()));

    if (disabledCommands.length > 0) {
      embed.addField('Disabled Commands', humanize(disabledCommands.sort()));
    }

    embed.addField('Global Commands', humanize(globalList.sort()));

    message.channel.send({ embeds: [embed] });
    analytics.trackUsage('list', message);
  });

  // TODO: Switch to slash command
  // Handle help for specific command
  aquarius.onCommand(/^help (?<command>.+)$/i, (message, { groups }) => {
    log.info(
      `Help request for ${chalk.blue(groups.command)} in "${chalk.green(
        message.guild.name
      )}#${chalk.green(message.channel.name)}"`,
      getMessageMeta(message)
    );
    const help = aquarius.help.get(groups.command);

    if (help) {
      const check = checkBotPermissions(message.guild, ...info.permissions);

      if (!check.valid) {
        log.warn('Invalid permissions', getMessageMeta(message));
        message.channel.send(
          aquarius.permissions.getRequestMessage(check.missing)
        );
        return;
      }

      message.channel.send(helpMessage(aquarius, help, message.guild));
    } else {
      message.channel.send(
        `Sorry, I can't find a command named ${groups.command} :frowning:`
      );
    }

    analytics.trackUsage('lookup', message);
  });
};
