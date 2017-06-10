const Aquarius = require('../aquarius');
const fetch = require('node-fetch');

class FizzBuzz extends Aquarius.Command {
  constructor() {
    super();

    this.description = 'A fresh take on a classic programming problem.';
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} fizzbuzz [number]\`\`\``;
    return msg;
  }

  static makeFizzBuzzCall(number) {
    return fetch(`https://fozzbizz.herokuapp.com/fizzbuzz?num=${number}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        throw response.statusText;
      }).then(fizzBuzzJSON => {
        if (fizzBuzzJSON.is_fizz && fizzBuzzJSON.is_buzz) {
          return 'FizzBuzz';
        }
        if (fizzBuzzJSON.is_fizz) {
          return 'Fizz';
        }
        if (fizzBuzzJSON.is_buzz) {
          return 'Buzz';
        }
        return number;
      });
  }

  message(msg) {
    const input = Aquarius.Triggers.messageTriggered(msg, /^fizzbuzz ([\\d]+)$/i);

    if (input) {
      Aquarius.Loading.startLoading(msg.channel);

      this.makeFizzBuzzCall(input[1])
        .then(finalString => {
          msg.channel.send(finalString);
          Aquarius.Loading.stopLoading(msg.channel);
        }).catch(errorString => {
          msg.channel.send(`unable to fizzbuzz. Failed with ${errorString}. Ping @IanMitchel1 on twitter with your complaints`);
          Aquarius.Loading.stopLoading(msg.channel);
        });
    }
  }
}

module.exports = new FizzBuzz();
