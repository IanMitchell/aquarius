const Aquarius = require('../aquarius');
const fetch = require('node-fetch');

class Pokédex extends Aquarius.Command {
  constructor() {
    super();

    this.name = 'Pokedex';
    this.description = 'Returns basic information about Pokémon';

    // This helps circumvent API rate limiting
    this.pokémonMap = new Map();
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} pokedex [name|id]\`\`\``;
    return msg;
  }

  addPokémon(pokémon, msg) {
    this.log(`Adding ${pokémon} entry`);

    Aquarius.Loading.startLoading(msg.channel);

    return fetch(`http://pokeapi.co/api/v2/pokemon/${pokémon}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        msg.channel.send('Cannot find Pokémon.');
        return false;
      })
      .then(json => {
        if (json) {
          const pkm = {
            id: json.id,
            name: json.name,
            types: json.types,
            image: json.sprites.front_default,
          };

          this.pokémonMap.set(json.id.toString(), pkm);
          this.pokémonMap.set(json.name, pkm);
        }
      })
      .catch(err => this.log(err));
  }

  getPokémon(msg, pokémon) {
    if (this.pokémonMap.has(pokémon.toLowerCase())) {
      this.outputPokémon(msg, pokémon.toLowerCase());
    } else {
      this.addPokémon(pokémon.toLowerCase(), msg)
        .then(() => this.outputPokémon(msg, pokémon.toLowerCase()))
        .then(() => Aquarius.Loading.stopLoading(msg.channel));
    }
  }

  outputPokémon(msg, id) {
    if (this.pokémonMap.has(id)) {
      const pokémon = this.pokémonMap.get(id);
      const types = pokémon.types.map(type => type.type.name.capitalize()).join(', ');
      const content = `#${pokémon.id} ${pokémon.name.capitalize()} (${types})`;
      msg.channel.sendFile(pokémon.image, `${pokémon.name}.png`, content);
    }
  }

  message(msg) {
    const pokémonInput = Aquarius.Triggers.messageTriggered(msg, new RegExp([
      '^(?:pok(?:e|é)mon|pok(?:e|é)dex) ',
      '([\\d]{1,4}|[\\w]+)$',
    ].join(''), 'i'));

    if (pokémonInput) {
      this.log(`Request for ${pokémonInput[1]}`);
      this.getPokémon(msg, pokémonInput[1]);
    }
  }
}

module.exports = new Pokédex();
