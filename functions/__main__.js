const getTweets = require('../src/getTweets');
const markov = require('../src/markov');

/**
* @returns {any}
*/
module.exports = (context, callback) => {
  return getTweets('djkhaled')
    .then(tweets => {
      generator = new markov.Generator(2, 20);

      tweets.map(tweet => {
        generator.feed(tweet);
      });

      return callback(null, generator.generate());
    })
    .catch(error => {
      return callback(error);
    });
};
