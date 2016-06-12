const moment = require('moment');
const triggers = require('../util/triggers');
const Command = require('../core/command');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Quote = sequelize.import('../models/quote');

class Quotes extends Command {
  getQuote(quoteId, serverId) {
    const query = Quote.findOne({
      where: {
        quoteId,
        serverId,
      },
    }).then(quote => {
      if (quote) {
        const time = moment(quote.createdAt).fromNow();
        return `*Quote ${quote.quoteId} added by ${quote.addedBy} ${time}*\n${quote.quote}`;
      }

      return `No quote found with id #${quoteId}`;
    });

    return query;
  }

  message(msg) {
    if (triggers.messageTriggered(msg, /^(?:random quote|quote random)$/)) {
      this.log('Reading random quote');
      Quote.count({
        where: {
          serverId: msg.channel.server.id,
        },
      }).then(count => {
        const id = Math.ceil(Math.random() * count);
        this.getQuote(id, msg.channel.server.id).then(response => {
          msg.client.sendMessage(msg.channel, response);
        });
      });

      return false;
    }

    const readInput = triggers.messageTriggered(msg, /^(?:read )?quote #?([0-9]+)$/i);
    if (readInput) {
      this.log(`Reading quote ${readInput[1]}`);
      this.getQuote(readInput[1], msg.channel.server.id).then(response => {
        msg.client.sendMessage(msg.channel, response);
      });

      return false;
    }

    const newInput = triggers.messageTriggered(msg,
                      /^(?:(?:(?:new|add) quote)|(?:quote (?:new|add))) ([^]*)$/i);
    if (newInput) {
      const quote = newInput[1];

      if (quote) {
        this.log(`Adding new quote: ${quote}`);

        // TODO: Consider max(quote_id).where(server) to prevent quote_id collisions
        Quote.count({
          where: {
            serverId: msg.channel.server.id,
          },
        }).then(count => {
          Quote.create({
            serverId: msg.channel.server.id,
            channel: msg.channel.name,
            addedBy: msg.author.username,
            quoteId: count + 1,
            quote,
          }).then(() => msg.client.sendMessage(msg.channel, `Quote added as #${count + 1}.`));
        });
        return false;
      }

      return 'Your new quote needs content!';
    }

    return false;
  }

  helpMessage() {
    let helpMessage = '`@bot (new|add) quote [quote text here]`. Adds a new quote to the server.\n';
    helpMessage += '`@bot read quote [quote id]`. Reads a quote back from the server.\n';
    helpMessage += '`@bot random quote`. Picks a random quote from the server and reads it.';

    return helpMessage;
  }
}

module.exports = new Quotes();
