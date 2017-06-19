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
        if (!fizzBuzzJSON.is_fizz && !fizzBuzzJSON.is_buzz) {
          return number;
        }
        return `${fizzBuzzJSON.is_fizz ? 'Fizz' : ''}${fizzBuzzJSON.is_buzz ? 'Buzz' : ''}`;
      });
  }

  message(msg) {
    const input = Aquarius.Triggers.messageTriggered(msg, /^fizzbuzz (.+)$/i);

    if (input) {
      const parsed_float = parseFloat(input[1]);
      const parsed_int = parseInt(input[1]);

      Aquarius.Loading.startLoading(msg.channel);

      if ((parsed_int !== 0) && (!parsed_int)) {
        msg.channel.send(`unable to convert ${input[1]} to integer. Ping @IanMitchel1 on twitter with your complaints`);
        Aquarius.Loading.stopLoading(msg.channel);
      } else if (parsed_int != parsed_float) {
        msg.channel.send(`fizzbuzziness of a non-integer number is not defined. Ping @IanMitchel1 on twitter with your complaints`);
        Aquarius.Loading.stopLoading(msg.channel);
      } else if (parsed_int < 0) {
        msg.channel.send(`fizzbuzziness of a negative number is not defined. Ping @IanMitchel1 on twitter with your complaints`);
        Aquarius.Loading.stopLoading(msg.channel);
      } else {

        FizzBuzz.makeFizzBuzzCall(parsed_int)
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
}

module.exports = new FizzBuzz();
