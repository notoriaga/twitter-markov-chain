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
      fs.writeFileSync('tweets.txt', feeds[0])
      return callback(null);
    })
    .catch(error => {
      return callback(error);
    });
};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);
