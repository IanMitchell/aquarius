const Aquarius = require('../aquarius');
const hdb = require('hearthstone-db');

class Hearthstone extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Displays Hearthstone Card Image';
  }

  helpMessage() {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```[[Tirion Fordring]]```';
    return msg;
  }

  message(msg) {
    const hearthInput = Aquarius.Triggers.cardTrigger(msg);

    if (hearthInput) {
      hearthInput.forEach(cardInput => {
        this.log(`Request for ${cardInput[1]}`);
        const cardName = cardInput[1].toLowerCase();

        Aquarius.Loading.startLoading(msg.channel);
        hdb.allCards.forEach(card => {
          if (card.name.toLowerCase() === cardName) {
            return msg.channel.sendFile(card.image_url, `${card.name}.png`);
          }
        });
        Aquarius.Loading.stopLoading(msg.channel);
      });
    }
  }
}

module.exports = new Hearthstone();
