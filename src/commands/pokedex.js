const fetch = require('node-fetch');
const Command = require('../core/command');
const triggers = require('../util/triggers');
const string = require('../util/string');

class Pokédex extends Command {
  constructor() {
    super();

    // This helps circumvent API rate limiting
    this.pokémonMap = new Map();
  }

  addPokémon(pokémon, msg) {
    this.log(`Adding ${pokémon} entry`);
    return fetch(`http://pokeapi.co/api/v2/pokemon/${pokémon}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        this.client.sendMessage(msg.channel, 'Cannot find pokemon.');
        return false;
      }).then(json => {
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
      }).catch(err => this.log(err));
  }

  getPokémon(msg, pokémon) {
    if (this.pokémonMap.has(pokémon.toLowerCase())) {
      this.outputPokémon(msg, pokémon.toLowerCase());
    } else {
      this.addPokémon(pokémon.toLowerCase(), msg).then(() => {
        this.outputPokémon(msg, pokémon.toLowerCase());
      });
    }
  }

  outputPokémon(msg, id) {
    if (this.pokémonMap.has(id)) {
      const pokémon = this.pokémonMap.get(id);
      const types = pokémon.types.map(type => string.capitalize(type.type.name)).join(', ');
      const content = `#${pokémon.id} ${string.capitalize(pokémon.name)} (${types})`;
      this.client.sendFile(msg.channel, pokémon.image, `${pokémon.name}.png`, content);
    }
  }

  message(msg) {
    const pokémonInput = triggers.messageTriggered(msg, new RegExp([
      '^(?:pok(?:e|é)mon|pok(?:e|é)dex) ',
      '([\\d]{1,4}|[\\w]+)$',
    ].join(''), 'i'));

    if (pokémonInput) {
      this.log(`Request for ${pokémonInput[1]}`);
      this.getPokémon(msg, pokémonInput[1]);
    }

    return false;
  }

  helpMessage() {
    return '`@bot pokedex [name or id]`. Displays information about the Pokémon';
  }
}

module.exports = new Pokédex();
