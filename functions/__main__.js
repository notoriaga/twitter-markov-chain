const getTweets = require('../src/getTweets');
const generateTweet = require('../src/generateTweet');
const wordCache = require('../src/WordCache');

/**
* @param {array} twitterHandles
* @returns {any}
*/
module.exports = (twitterHandles = ['keithwhor', 'realdonaldtrump'], context, callback) => {
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
      let wc = wordCache.buildWordCache(flatten(feeds));
      let tweet = wordCache.generateTweet(wc);

      // let sorted = Object.keys(wc)
      //   .sort((w1, w2) => wc[w1].count < wc[w2].count ? 1 : -1)
      //   .map(word => {
      //     return {
      //       word: word,
      //       count: wc[word].count
      //     };
      //   });
      return callback(null, tweet);
    })
    .catch(error => {
      return callback(error);
    });
};

const flatten = list =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
