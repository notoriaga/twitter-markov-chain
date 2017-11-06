const Markov = require('./markov');

const pos = require('pos');
const parser = new pos.Lexer();
const tagger = new pos.Tagger();
tagger.extendLexicon({ t: ['SYM'], '--&gt:': ['SYM'], M: ['SYM'] });

module.exports = tweets => {
  let corpus = require('./corpus');
  let cleanedCorpus = prepText(corpus);
  let posGenerator = markovPos(cleanedCorpus); // markov chain that generates 'sentances' consisting of parts of speech

  let posMap = tweetsToPos(tweets); // mapping of part of speech to words found on twitter
  let posArray = posGenerator.generate(3);

  for (var i = 0; i < 10; i++) {
    let x = posArray
      .reduce((sentance, pos) => {
        let nextWord = choice(posMap[pos]);
        //  console.log(pos, nextWord);
        // If punct, don't add a space. Capitilize first letter of each world, jaden style
        return ['.', '?', ',', '!'].includes(nextWord)
          ? `${sentance}${nextWord}`
          : `${sentance} ${nextWord.charAt(0).toUpperCase() + nextWord.slice(1)}`;
      }, '')
      .trim();
    console.log(x);
  }
};

const prepText = text => {
  return text
    .replace(/\n/g, ' ') //remove newlines
    .replace(/\s+/g, ' ') //remove whitespace
    .replace(/['"”““()]+/g, '') //remove quotes
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|') //match(/[^\.!\?]+[\.!\?]+/g) //split on punct
    .map(sentance => sentance.trim().toLowerCase());
};

const choice = arr => {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const markovPos = sentances => {
  let generator = new Markov(3);

  for (let i = 0; i < sentances.length; i++) {
    let current = sentances[i];
    let parsed = parser.lex(current);
    let tags = tagger.tag(parsed).map(taggedWord => taggedWord[1]);
    generator.feed(tags);
  }

  return generator;
};

const tweetsToPos = tweets => {
  return tweets.reduce((wordsByPos, tweet) => {
    let parsed = parser.lex(tweet);
    tagger.tag(parsed).map(([word, tag]) => {
      word = word.replace(/['"”““()]+/g, '')
      if (!(tag in wordsByPos)) {
        wordsByPos[tag] = [];
      }
      wordsByPos[tag].push(word);
    });
    return wordsByPos;
  }, {});
};
