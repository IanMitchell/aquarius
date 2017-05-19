const Aquarius = require('../aquarius');
const mtg = require('mtgsdk');

class Magic extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Displays Magic The Gathering Card Image';
  }

  helpMessage() {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```Display the [[Archangel Avacyn]] card, bot!```';
    return msg;
  }

  message(msg) {
    const magicInput = Aquarius.Triggers.cardTrigger(msg);

    if (magicInput) {
      magicInput.forEach(cardInput => {
        this.log(`Request for ${cardInput[1]}`);

        Aquarius.Loading.startLoading(msg.channel);
        mtg.card.where({ name: `"${cardInput[1]}"` }).then(cards => {
          cards.some(card => {
            if (card.imageUrl) {
              return msg.channel.send(card.imageUrl);
            }

            return false;
          });
        }).then(() => Aquarius.Loading.stopLoading(msg.channel));
      });
    }
  }
}

module.exports = new Magic();
