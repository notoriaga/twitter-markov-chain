const getTweets = require('../src/getTweets');
const generateTweet = require('../src/generateTweet');

/**
* @param {array} twitterHandles
* @returns {any}
*/
module.exports = (twitterHandles = ['officialjaden'], context, callback) => {
  let feedPromises = twitterHandles.map(user => {
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
      let tweet = generateTweet(flatten(feeds));
      return callback(null, tweet);
    })
    .catch(error => {
      return callback(error);
    });
};

const flatten = list =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
