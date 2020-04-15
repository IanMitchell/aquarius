import Sentry from '@aquarius/sentry';
import debug from 'debug';
import dedent from 'dedent-js';
import Discord from 'discord.js';
import { helpMessage } from './help';

// CJS / ESM compatibility
const { RichEmbed } = Discord;

const log = debug('Services');

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
    Hello! There are several services you can to:

    ${services
      .getNames()
      .map((name, index) => `${index + 1}) \`${name}\``)
      .join('\n')}

    Which would you link to setup? (You can reply \`stop\` at any time to quit)
  `;

  while (!services.has(input.toLowerCase())) {
    log(`Could not find account ${input}`);
    input = yield "Sorry, I don't know that account type - can you try spelling it like I listed above?";
  }

  accountInformation.name = input.toLowerCase();

  log(`Prompting for ${input.toLowerCase()}`);
  for (const step of services.getInformation(input.toLowerCase()).steps) {
    const value = yield step.instructions;
    accountInformation.fields.push({ name: step.field, value });
  }

  log('Creating link');
  return accountInformation;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // Gently guide people trying to link accounts in a guild channel
  aquarius.onCommand(/^services$/i, async (message) => {
    log('Service request in guild channel');
    message.channel.send(
      'To add a service, please send me `services add` via direct message'
    );
    analytics.trackUsage('channel', message);
  });

  aquarius.onDirectMessage(/^services$/i, async (message) => {
    log('Service help request in DM');
    message.channel.send(helpMessage(aquarius, info));
    analytics.trackUsage('dm help', message);
  });

  aquarius.onDirectMessage(/^services list$/i, async (message) => {
    log(`Listing services for ${message.author.username}`);
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
      log(`Viewing ${serviceKey} for ${message.author.username}`);

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

      const embed = new RichEmbed({
        title: service.name,
      });

      const fields = await aquarius.services.getLink(
        message.author,
        serviceKey
      );

      Array.from(Object.entries(fields)).map(([name, value]) =>
        embed.addField(name, value, true)
      );

      message.channel.send(embed);
      analytics.trackUsage('view', message);
    }
  );

  aquarius.onDirectMessage(
    /^services remove (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();
      log(`Removing ${serviceKey} for ${message.author.username}`);

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
    log(`Adding service to ${message.author.username}`);

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
        log(reason);
        message.channel.send(
          'Sorry, something went wrong. Please try again later!'
        );
      }
    }
  });
};
