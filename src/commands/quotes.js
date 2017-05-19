const Aquarius = require('../aquarius');
const moment = require('moment');
const Quote = Aquarius.Sequelize.import('../models/quote');

class Quotes extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'Store memorable quotes from your server';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```';
    msg += `@${nickname} add quote [message]\n`;
    msg += `@${nickname} read quote [id]\n`;
    msg += `@${nickname} random quote\n`;
    msg += '```';

    return msg;
  }

  getQuote(quoteId, guildId) {
    const query = Quote.findOne({
      where: {
        quoteId,
        guildId,
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
    if (Aquarius.Triggers.messageTriggered(msg, /^(?:random quote|quotes random)$/)) {
      this.log('Reading random quote');
      Quote.count({
        where: {
          guildId: msg.channel.guild.id,
        },
      }).then(count => {
        const id = Math.ceil(Math.random() * count);
        this.getQuote(id, msg.channel.guild.id).then(response => {
          msg.channel.send(response);
        });
      });

      return;
    }

    const readInput = Aquarius.Triggers.messageTriggered(msg, /^(?:read )?quotes? #?([0-9]+)$/i);
    if (readInput) {
      this.log(`Reading quote ${readInput[1]}`);
      this.getQuote(readInput[1], msg.channel.guild.id).then(response => {
        msg.channel.send(response);
      });

      return;
    }

    const newInput = Aquarius.Triggers.messageTriggered(msg,
                      /^(?:(?:(?:new|add) quote)|(?:quotes (?:new|add))) ([^]*)$/i);
    if (newInput) {
      const quote = newInput[1];

      if (quote) {
        this.log(`Adding new quote: ${quote}`);

        // TODO: Consider max(quote_id).where(server) to prevent quote_id collisions
        Quote.count({
          where: {
            guildId: msg.channel.guild.id,
          },
        }).then(count => {
          Quote.create({
            guildId: msg.channel.guild.id,
            channel: msg.channel.name,
            addedBy: msg.author.username,
            quoteId: count + 1,
            quote,
          }).then(() => msg.channel.send(`Quote added as #${count + 1}.`));
        });
        return;
      }

      msg.channel.send('Your new quote needs content!');
    }
  }
}

module.exports = new Quotes();
