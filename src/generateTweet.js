const Markov = require('./markov');

const pos = require('pos');
const parser = new pos.Lexer();
const tagger = new pos.Tagger();
tagger.extendLexicon({ t: ['SYM'], '--&gt:': ['SYM'], M: ['SYM'], J: ['SYM'] });

module.exports = tweets => {
  let corpus = require('./corpus');
  let cleanedCorpus = prepText(corpus);
  let posGenerator = markovPos(cleanedCorpus); // markov chain that generates 'sentences' consisting of parts of speech

  let posMap = tweetsToPos(tweets); // mapping of part of speech to words found on twitter
  let posArray = posGenerator.generate(4);

  return posArray
    .reduce((sentence, pos) => {
      let nextWord = choice(posMap[pos]);
      return ['.', '?', ',', '!'].includes(nextWord)
        ? `${sentence}${nextWord}`
        : `${sentence} ${nextWord.charAt(0).toUpperCase() + nextWord.slice(1)}`;
    }, '')
    .trim()
    .replace(/([.,\/#!$%\^&\*;:{}=\-_`~()\]\[])+$/g, '');
};

const prepText = text => {
  return text
    .replace(/\n/g, ' ') //remove newlines
    .replace(/\s+/g, ' ') //remove whitespace
    .replace(/['"”“()]+/g, '') //remove quotes
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|') //match(/[^\.!\?]+[\.!\?]+/g) //split on punct
    .map(sentence => sentence.trim().toLowerCase());
};

const choice = arr => {
  if (!arr) return 'NN';
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const markovPos = sentences => {
  let generator = new Markov(3);

  for (let i = 0; i < sentences.length; i++) {
    let current = sentences[i];
    let parsed = parser.lex(current);
    let tags = tagger.tag(parsed).map(taggedWord => taggedWord[1]);
    generator.feed(tags);
  }

  return generator;
};

const tweetsToPos = tweets => {
  return tweets.reduce((wordsByPos, tweet) => {
    let parsed = parseTweet(tweet);
    tagger.tag(parsed).map(([word, tag]) => {
      word = word.replace(/['"”““()]+/g, '');
      if (!(tag in wordsByPos)) {
        wordsByPos[tag] = [];
      }
      wordsByPos[tag].push(word);
    });
    return wordsByPos;
  }, {});
};

const parseTweet = tweet => {
  let splitRegex = /[^a-zA-Z#.,]+/;
  let regexFilterPatterns = [
    /https?:\/\/[-a-zA-Z0-9@:%_\+.~#?&\/=]+/g, //remove urls
    /\b[a-z][a-z]?\b/g, //remove short words
    /@[a-z0-9_-]+/g, //remove mentions
    ':'
  ];

  regexFilterPatterns.map(pattern => {
    tweet = tweet.replace(pattern, ' ').trim();
  });

  return tweet
    .split(splitRegex)
    .filter(word => word !== '')
    .map(word => word.toLowerCase());
};
