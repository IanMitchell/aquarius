import debug from 'debug';
import dedent from 'dedent-js';
import { helpMessage } from './help.js';

const log = debug('Link');

// TODO: Write Info
export const info = {
  name: 'link',
  description: '',
  usage: '',
  disabled: true,
};

// TODO: Finish Implementation and Test

// DM Timeout
const LINK_RESPONSE_PERIOD = 1000 * 60 * 5;

function* accountLinkGenerator(services) {
  const accountInformation = {
    name: '',
    fields: [],
  };

  log('Beginning prompt');
  let input = yield dedent`
    Hello! There are several services you can link with me. Please respond with a supported service name to begin, or 'stop' at any time to quit.

    **Available Services**

    ${services.getServiceNames().join(', ')}
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

  // yield *services.getServiceInformation(input.toLowerCase()).steps;

  log('Creating link');
  return accountInformation;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  // One link request at a time per person
  const activeRequests = new Set();

  // Gently guide people trying to link accounts in a guild channel
  aquarius.onCommand(/link/i, async message => {
    if (message.channel.type === 'dm') {
      message.channel.send(helpMessage(info));
    } else {
      message.channel.send(
        'To link an account with me, please send me "link" via direct message'
      );
    }
  });

  aquarius.onTrigger(/link/i, async message => {
    if (message.channel.type === 'dm') {
      message.channel.send(helpMessage(info));
    }
  });

  aquarius.onTrigger(/link remove/i, async message => {
    if (message.channel.type === 'dm') {
      log(`Unlink request by ${message.author.username}`);
      // TODO: Prompt for and Remove service link
    }
  });

  // Guide users through linking accounts in DM
  aquarius.onTrigger(/link add/i, async message => {
    if (message.channel.type === 'dm') {
      if (!activeRequests.has(message.author.id)) {
        return;
      }

      log(`Link request by ${message.author.username}`);
      activeRequests.add(message.author.id);

      // Begin service name prompt
      const link = accountLinkGenerator(aquarius.services);
      const initialPrompt = link.next();
      log(initialPrompt);
      message.channel.send(initialPrompt.value);

      // Wait for response
      const collector = message.channel.createMessageCollector(
        msg => !msg.author.bot,
        { time: LINK_RESPONSE_PERIOD }
      );

      // Response handler
      collector.on('collect', msg => {
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
          // TODO: Prompt has all information we need to save to database
          log(prompt);
          message.channel.send(dedent`
            Setting up a link for ${prompt.value.name} with fields:

            \`\`\`
            ${prompt.value.fields.map(field => `${field.name}: ${field.value}`)}
            \`\`\`
          `);
          collector.stop('linked');
        }
      });

      // We've stopped listening for new responses
      collector.on('end', (msgs, reason) => {
        log(`Ending Collector for ${message.author.username} (${reason})`);

        // Send a message based on why we stopped listening
        if (reason === 'manual') {
          message.channel.send(
            'Ok! If you want to link a service later just type `link add`!'
          );
        } else if (reason !== 'linked') {
          message.channel.send(
            "I haven't heard from you, so I'm going to stop the link process. If you want to try again later please type `link add`!"
          );
        }

        // Remove active request
        activeRequests.delete(message.author.id);
      });
    }
  });
};
