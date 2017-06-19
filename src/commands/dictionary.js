const fetch = require('node-fetch');
const DOMParser = require('xmldom').DOMParser;
const Discord = require('discord.js');
const Aquarius = require('../aquarius');

const API_URL = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml';

class Dictionary extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'Provides the definition for a word';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} define [word]\`\`\``;
    msg += '\nExample:\n';
    msg += '```';
    msg += `@${nickname} define preeminent\n`;
    msg += '```';

    return msg;
  }

  getDefinition(dom) {
    const list = dom.getElementsByTagName('def')[0];
    const entries = Array.from(list.getElementsByTagName('dt'))
                         .map(el => `${el.textContent}\n`);
    return entries.join('');
  }

  getPlural(dom) {
    const list = dom.getElementsByTagName('in');

    if (list.length > 0) {
      const entries = Array.from(list[0].getElementsByTagName('if'))
                           .map(el => `**${el.textContent}**`);
      return entries.join(' _or_ ');
    }

    return 'None';
  }

  getPronunciation(dom) {
    return dom.getElementsByTagName('pr')[0].textContent;
  }

  message(msg) {
    const inputs = Aquarius.Triggers.messageTriggered(msg, /^define (.+)$/i);

    if (inputs) {
      this.log(`Input: ${inputs[1]}`);

      Aquarius.Loading.startLoading(msg.channel);
      fetch(`${API_URL}/${inputs[1]}?key=${process.env.DICTIONARY_API_KEY}`)
        .then(res => res.text())
        .then(xml => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(xml, 'text/xml');

          const message = new Discord.RichEmbed({
            title: dom.getElementsByTagName('ew')[0].textContent.capitalize(),
            color: 0x0074D9,
            footer: {
              text: 'Definitions provided by Merriam Webster',
            },
            fields: [
              {
                name: 'Definition',
                value: this.getDefinition(dom),
              },
              {
                name: 'Plural',
                value: this.getPlural(dom),
              },
              {
                name: 'Pronunciation',
                value: this.getPronunciation(dom),
              },
            ],
          });

          msg.channel.sendEmbed(message).catch(this.log);
          Aquarius.Loading.stopLoading(msg.channel);
        })
        .catch(err => {
          this.log(err);
          msg.channel.send('Sorry, I encountered an error').catch(this.log);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }
  }
}

module.exports = new Dictionary();
