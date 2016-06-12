const fetch = require('node-fetch');
const Command = require('../core/command');
const triggers = require('../util/triggers');

class Pokédex extends Command {
  constructor() {
    super();

    // This helps circumvent API rate limiting
    this.nameMap = new Map();
    this.pokemonMap = new Map();

    this.client.on('ready', () => {
      this.log('Creating pokemon map');

      // fetch('http://pokeapi.co/api/v2/pokemon/?limit=10000')
      //   .then(response => response.json())
      //   .then(json => {
      //     log(json);
      //     json.results.forEach(result => {
      //       fetch(result.url)
      //         .then(res => res.json())
      //         .then(pokemon => {
      //           log(`Creating entry for ${pokemon.id}`);
      //           nameMap.set(pokemon.id, pokemon.name);
      //
      //           const pkm = {
      //             name: pokemon.name,
      //             types: pokemon.types,
      //             image: pokemon.sprites.front_default,
      //           };
      //
      //           pokemonMap.set(pokemon.id, pkm);
      //         }).catch(err => log(err));
      //     });
      //   }).catch(err => log(err));

      this.log('Done creating Pokemon map');
    });
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  message(msg) {
    const pokemonInput = triggers.messageTriggered(msg, new RegExp([
      '^(?:pok(?:e|é)mon|pok(?:e|é)dex) ',
      '([\\d]{1,4}|[\\w])$',
    ].join(''), 'i'));

    if (pokemonInput) {
      this.log(`Request for ${pokemonInput[1]}`);

      let id = pokemonInput[1];

      if (/^\d+$/.test(pokemonInput[1]) === false) {
        id = this.nameMap.get(id);
      }

      if (this.pokemonMap.has(id)) {
        const pokemon = this.pokemonMap.get(id);
        const types = pokemon.types.map(type => this.capitalize(type.type.name)).join(', ');
        const content = `#${pokemon.id} ${pokemon.name} (${types})`;
        this.client.sendFile(msg.channel, pokemon.sprites.front_default, pokemon.name, content);
      } else {
        return `I can't find a Pokémon with National Pokédex id ${id} :(`;
      }
    }

    return false;
  }

  helpMessage() {
    return '`@bot pokedex [name or id]`. Displays information about the Pokémon';
  }
}

module.exports = new Pokédex();
