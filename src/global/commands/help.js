import debug from 'debug';
import dedent from 'dedent-js';
import { Permissions, RichEmbed } from 'discord.js';
import { getPermissionName } from '../../lib/core/permissions';
import { getNickname } from '../../lib/core/users';
import { getGitHubLink, getHost } from '../../lib/helpers/links';
import { humanize, setDifference } from '../../lib/helpers/lists';
import { capitalize } from '../../lib/helpers/strings';

const log = debug('Help');

const EMOJI = {
  VALID: ':white_check_mark:',
  INVALID: ':x:',
};

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

  const nickname = guild ? getNickname(guild, aquarius.user) : 'Aquarius';

  const embed = new RichEmbed({
    author: {
      name: 'Aquarius',
      icon_url: aquarius.user.avatarURL,
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
      commandInfo.permissions.map(permission => {
        if (guild.me.hasPermission(permission)) {
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
  // Handle generic help
  aquarius.onCommand(/^help$/i, async message => {
    log(`Help request in "${message.guild.name}#${message.channel.name}"`);

    const check = aquarius.permissions.check(
      message.guild,
      ...info.permissions
    );

    if (!check.valid) {
      log('Invalid permissions');
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

    message.channel.send(embed);
    analytics.trackUsage('list', message);
  });

  // Handle help for specific command
  aquarius.onCommand(/^help (?<command>.+)$/i, async (message, { groups }) => {
    log(
      `Help request for ${groups.command} in "${message.guild.name}#${message.channel.name}"`
    );
    const help = aquarius.help.get(groups.command);

    if (help) {
      const check = aquarius.permissions.check(
        message.guild,
        ...info.permissions
      );

      if (!check.valid) {
        log('Invalid permissions');
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
