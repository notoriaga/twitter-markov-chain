const getTweets = require('../src/getTweets.js');
const wordCache = require('../src/wordCache.js');

/**
* @param {array} twitterHandles
* @returns {any}
*/
module.exports = (twitterHandles = ['officialjaden', 'justintrudeau'], context, callback) => {
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
      const genTweet = wc => {
        let tweet = wordCache.generateTweet(wc);
        if (tweet.length > 140) {
          return genTweet(wc);
        }
        return tweet;
      };
      let wc = wordCache.buildWordCache(flatten(feeds));
      let tweet = genTweet(wc);
      return callback(null, tweet);
    })
    .catch(error => {
      console.log(error)
      return callback(error);
    });
};

const flatten = list =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
