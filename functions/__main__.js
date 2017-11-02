const getTweets = require('../src/getTweets');
const Markov = require('../src/markov');


const fs = require('fs');
/**
* @param {array} users
* @returns {any}
*/
module.exports = (users, context, callback) => {

  let feedPromises = users.map(user => {
    return getTweets(user)
      .then(tweets => {
        return tweets;
      })
      .catch(error => {
        callback(new Error(`Could not fetch ${user}\'s tweets`));
      });
  });

  Promise.all(feedPromises)
    .then(feeds => {
      markov = new Markov(flatten(feeds))
      let markovTweets = [];
      for (let i = 0; i < 20; i++) {
        markovTweets.push(markov.generate(10));
      }
      return callback(null, markovTweets);
    })
    .catch(error => {
      return callback(error);
    });
};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);
