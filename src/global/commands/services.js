import debug from 'debug';
import dedent from 'dedent-js';
import { RichEmbed } from 'discord.js';
import Sentry from '../../lib/analytics/sentry';
import { helpMessage } from './help';

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

  log('Beginning prompt');
  let input = yield dedent`
    Hello! There are several services you can to:

    ${services.getServiceNames().join(', ')}

    Which would you link to setup? (You can reply \`stop\` at any time to quit)
  `;
  log(input);

  while (!services.has(input.toLowerCase())) {
    log(`Could not find account ${input}`);
    input = yield "Sorry, I don't know that account type - can you try spelling it like I listed above?";
  }

  accountInformation.name = input.toLowerCase();

  log('Prompting for steps');
  for (const step of services.getInformation(input.toLowerCase()).steps) {
    const value = yield step.instructions;
    accountInformation.fields.push({ name: step.field, value });
  }

  log('Creating link');
  return accountInformation;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  // Gently guide people trying to link accounts in a guild channel
  aquarius.onCommand(/^services$/i, async message => {
    message.channel.send(
      'To add a service, please send me `services add` via direct message'
    );
  });

  aquarius.onDirectMessage(/^services$/i, async message => {
    message.channel.send(helpMessage(info));
  });

  aquarius.onDirectMessage(/^services list$/i, async message => {
    const services = await aquarius.services.getLinks(message.author);

    if (services.length < 1) {
      message.channel.send("You haven't added any services!");
      return;
    }

    message.channel.send(`You've added these services: ${services.join(', ')}`);
  });

  aquarius.onDirectMessage(
    /^services view (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();

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
    }
  );

  aquarius.onDirectMessage(
    /^services remove (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();

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
    }
  );

  // Guide users through linking accounts in DM
  aquarius.onDirectMessage(/services add/i, async message => {
    log(`Add request by ${message.author.username}`);

    try {
      const link = getServiceLinkInformation(aquarius.services);
      let prompt = link.next();

      while (!prompt.done) {
        // eslint-disable-next-line no-await-in-loop
        const value = await aquarius.directMessages.prompt(prompt.value);
        prompt = link.next(value.cleanContent);
      }

      const fields = {};
      prompt.value.fields.forEach(field => {
        fields[field.name] = field.value;
      });

      await aquarius.services.setLink(
        message.author,
        prompt.value.name,
        fields
      );

      message.channel.send(`Added ${prompt.value.name}!`);
    } catch (reason) {
      if (reason === 'manual') {
        message.channel.send(
          'Ok! If you want to add a service later just DM me `services add`!'
        );
      } else if (reason === 'time') {
        message.channel.send(
          "I haven't heard from you in a bit, so I'm going to stop listening. If you want to try again later please send `services add`!"
        );
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