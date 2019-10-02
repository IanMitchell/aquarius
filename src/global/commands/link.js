import debug from 'debug';
import dedent from 'dedent-js';
import { RichEmbed } from 'discord.js';
import { helpMessage } from './help';

const log = debug('Link');

// TODO: Write Info
export const info = {
  name: 'link',
  description:
    'Link profiles to your Discord account for easy lookup and API use',
  usage: 'DM me `link`',
};

// DM Timeout
const LINK_RESPONSE_PERIOD = 1000 * 60 * 5;

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

  while (!services.hasService(input.toLowerCase())) {
    log(`Could not find account ${input}`);
    input = yield "Sorry, I don't know that account type - can you try spelling it like I listed above?";
  }

  accountInformation.name = input.toLowerCase();

  log('Prompting for steps');
  for (const step of services.getServiceInformation(input.toLowerCase())
    .steps) {
    const value = yield step.instructions;
    accountInformation.fields.push({ name: step.field, value });
  }

  log('Creating link');
  return accountInformation;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  // One link request at a time per person
  const activeRequests = new Set();

  // Gently guide people trying to link accounts in a guild channel
  aquarius.onCommand(/^link$/i, async message => {
    message.channel.send(
      'To link an account with me, please send me "link" via direct message'
    );
  });

  aquarius.onDirectMessage(/^link$/i, async message => {
    // TODO: Fix
    message.channel.send(helpMessage(info));
  });

  aquarius.onDirectMessage(/^link list$/i, async message => {
    const services = await aquarius.services.getServiceListForUser(
      message.author
    );

    if (services.length < 1) {
      message.channel.send("You don't have any services linked");
      return;
    }

    message.channel.send(
      `You have links to these services: ${services.join(', ')}`
    );
  });

  aquarius.onDirectMessage(
    /^link view (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();

      if (!aquarius.services.hasService(serviceKey)) {
        message.channel.send("Sorry but I don't know that service name");
        return;
      }

      const serviceKeys = await aquarius.services.getServiceKeysForUser(
        message.author
      );

      if (!serviceKeys.includes(serviceKey)) {
        message.channel.send(
          "It doesn't look like you have a link to that service!"
        );
        return;
      }

      const service = aquarius.services.getServiceInformation(serviceKey);

      const embed = new RichEmbed({
        title: service.name,
      });

      const fields = await aquarius.services.getServiceForUser(
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
    /^link remove (?<service>.+)$/i,
    async (message, { groups }) => {
      const serviceKey = groups.service.toLowerCase();

      if (!aquarius.services.hasService(serviceKey)) {
        message.channel.send("Sorry but I don't know that service name");
        return;
      }

      const list = await aquarius.services.getServiceKeysForUser(
        message.author
      );

      if (!list.includes(serviceKey)) {
        message.channel.send(
          "It doesn't look like you have a link to that service!"
        );
        return;
      }

      await aquarius.services.removeServiceForUser(message.author, serviceKey);

      message.channel.send('Link removed!');
    }
  );

  // Guide users through linking accounts in DM
  aquarius.onDirectMessage(/link add/i, async message => {
    if (message.channel.type === 'dm') {
      if (activeRequests.has(message.author.id)) {
        return;
      }

      log(`Link request by ${message.author.username}`);
      activeRequests.add(message.author.id);

      // Begin service name prompt
      const link = getServiceLinkInformation(aquarius.services);
      const initialPrompt = link.next();

      message.channel.send(initialPrompt.value);

      // Wait for response
      const collector = message.channel.createMessageCollector(
        msg => !msg.author.bot,
        { time: LINK_RESPONSE_PERIOD }
      );

      // Response handler
      collector.on('collect', async msg => {
        // Handle exist requests
        if (msg.cleanContent === 'stop') {
          collector.stop('manual');
          return;
        }

        const prompt = link.next(msg.cleanContent);
        log(prompt);

        if (!prompt.done) {
          msg.channel.send(prompt.value);
        } else {
          log(prompt);

          const fields = {};
          prompt.value.fields.forEach(field => {
            fields[field.name] = field.value;
          });

          await aquarius.services.setServiceInformationForUser(
            message.author,
            prompt.value.name,
            fields
          );

          message.channel.send(`Set up a link for ${prompt.value.name}!`);
          collector.stop('linked');
        }
      });

      // We've stopped listening for new responses
      collector.on('end', (msgs, reason) => {
        log(`Ending Collector for ${message.author.username} (${reason})`);

        // Send a message based on why we stopped listening
        if (reason === 'manual') {
          message.channel.send(
            'Ok! If you want to link a service later just DM me `link add`!'
          );
        } else if (reason !== 'linked') {
          message.channel.send(
            "I haven't heard from you in a bit, so I'm going to stop listening. If you want to try again later please type `link add`!"
          );
        }

        // Remove active request
        activeRequests.delete(message.author.id);
      });
    }
  });
};
