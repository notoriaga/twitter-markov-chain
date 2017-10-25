const twit = require('twit');

const twitter = new twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports = user => {
  return twitter
    .get('statuses/user_timeline', {
      screen_name: user,
      count: 200,
      trim_user: true
    })
    .then(response => {
      return response.data.map(tweetData => tweetData.text);
    })
    .catch(error => {
      return error;
    });
};
