import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import dedent from 'dedent-js';
import { MessageEmbed } from 'discord.js';
import getLogger, { getMessageMeta } from '../../core/logging/log';
import { helpMessage } from './help';

const log = getLogger('Services');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'services',
  description: 'Link accounts and profiles with me for easy lookup and API use',
  usage: dedent`
  To see your linked services, DM me
  \`\`\`services list\`\`\`

  To link an account, DM me
  \`\`\`services add\`\`\`

  To remove a linked account, DM me
  \`\`\`services remove <name>\`\`\`

  To view a linked account, DM me
  \`\`\`services view <name>\`\`\`
  `,
};

function* getServiceLinkInformation(services) {
  const accountInformation = {
    name: '',
    fields: [],
  };

  let input = yield dedent`
    Hello! There are several services you can link to your account:

    ${services
      .getNames()
      .map((name, index) => `${index + 1}) \`${name}\``)
      .join('\n')}

    Which would you like to link? (You can reply \`stop\` at any time to quit)
  `;

  while (!services.has(input.toLowerCase())) {
    log.warn(`Could not find account ${chalk.blue(input)}`);
    input = yield "Sorry, I don't know that account type - can you try spelling it like I listed above?";
  }

  accountInformation.name = input.toLowerCase();

  log.info(`Prompting for ${input.toLowerCase()}`);
  for (const step of services.getInformation(input.toLowerCase()).steps) {
    const value = yield step.instructions;
    accountInformation.fields.push({ name: step.field, value });
  }

  log.info('Creating link');
  return accountInformation;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // Gently guide people trying to link accounts in a guild channel
  aquarius.onCommand(/^services$/i, (message) => {
    log.info('Service request in guild channel', getMessageMeta(message));
    message.channel.send(
      'To add a service, please send me `services add` via direct message'
    );
    analytics.trackUsage('channel', message);
  });

  aquarius.onDirectMessage(/^services$/i, async (message) => {
    log.info(
      `Service help request in DM for ${chalk.green(message.author.username)}`,
      getMessageMeta(message)
    );
    message.channel.send(helpMessage(aquarius, info));
    analytics.trackUsage('dm help', message);
  });

  aquarius.onDirectMessage(/^services list$/i, async (message) => {
    log.info(
      `Listing services for ${chalk.green(message.author.username)}`,
      getMessageMeta(message)
    );
    const services = await aquarius.services.getLinks(message.author);

    if (!services.length) {
      message.channel.send("You haven't added any services!");
      return;
    }

    message.channel.send(`You've added these services: ${services.join(', ')}`);
    analytics.trackUsage('list', message);
  });

  aquarius.onDirectMessage(
    /^services view (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();
      log.info(
        `Viewing ${chalk.blue(serviceKey)} for ${chalk.green(
          message.author.username
        )}`,
        getMessageMeta(message)
      );

      if (!aquarius.services.has(serviceKey)) {
        message.channel.send("Sorry but I don't know that service name");
        return;
      }

      const serviceKeys = await aquarius.services.getKeysForUser(
        message.author
      );

      if (!serviceKeys.includes(serviceKey)) {
        message.channel.send(
          "It doesn't look like you have a link to that service!"
        );
        return;
      }

      const service = aquarius.services.getInformation(serviceKey);

      const embed = new MessageEmbed({
        title: service.name,
      });

      const fields = await aquarius.services.getLink(
        message.author,
        serviceKey
      );

      Array.from(Object.entries(fields)).map(([name, value]) =>
        embed.addField(name, value, true)
      );

      message.channel.send({ embeds: [embed] });
      analytics.trackUsage('view', message);
    }
  );

  aquarius.onDirectMessage(
    /^services remove (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();
      log.info(
        `Removing ${chalk.blue(serviceKey)} for ${chalk.green(
          message.author.username
        )}`,
        getMessageMeta(message)
      );

      if (!aquarius.services.has(serviceKey)) {
        message.channel.send("Sorry but I don't know that service name");
        return;
      }

      const list = await aquarius.services.getKeysForUser(message.author);

      if (!list.includes(serviceKey)) {
        message.channel.send("It doesn't look like you've added that service!");
        return;
      }

      await aquarius.services.removeLink(message.author, serviceKey);

      message.channel.send('Service removed!');
      analytics.trackUsage('remove', analytics);
    }
  );

  // TODO: Allow for name input to jump into a service

  // Guide users through linking accounts in DM
  aquarius.onDirectMessage(/services add/i, async (message) => {
    log.info(
      `Adding service to ${chalk.green(message.author.username)}`,
      getMessageMeta(message)
    );

    try {
      const link = getServiceLinkInformation(aquarius.services);
      let prompt = link.next();

      while (!prompt.done) {
        // eslint-disable-next-line no-await-in-loop
        const value = await aquarius.directMessages.prompt(
          message.author,
          prompt.value
        );
        prompt = link.next(value.cleanContent);
      }

      const fields = {};
      prompt.value.fields.forEach((field) => {
        fields[field.name] = field.value;
      });

      await aquarius.services.setLink(
        message.author,
        prompt.value.name,
        fields
      );

      message.channel.send(`Added ${prompt.value.name}!`);
      analytics.trackUsage('add', message);
    } catch (reason) {
      if (reason === 'manual') {
        message.channel.send(
          'Ok! If you want to add a service later just DM me `services add`!'
        );
        analytics.trackUsage('add abort', message, { reason });
      } else if (reason === 'time') {
        message.channel.send(
          "I haven't heard from you in a bit, so I'm going to stop listening. If you want to try again later please send `services add`!"
        );
        analytics.trackUsage('add timeout', message, { reason });
      } else {
        Sentry.captureException(reason);
        log.warn(reason, getMessageMeta(message));
        message.channel.send(
          'Sorry, something went wrong. Please try again later!'
        );
      }
    }
  });
};
