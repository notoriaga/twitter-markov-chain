const salient = require('salient');
const tweetTokenizer = new salient.tokenizers.TweetTokenizer();

class Markov {
  constructor(n) {
    this.startwords = [];
    this.terminals = {};
    this.ngrams = {};
    this.n = n;
  }

  feed(sentance) {
    let tokens;
    if (sentance instanceof Array) {
      tokens = sentance;
    } else {
      tokens = tokenize(sentance);
    }

    if (tokens.length < this.n) {
      return false;
    }

    let start = tokens.slice(0, this.n).join(' ');

    this.startwords.push(start);
    this.terminals[tokens.slice(-this.n).join(' ')] = true;

    for (var i = 0; i < tokens.length - this.n; i++) {
      let gram = tokens.slice(i, i + this.n).join(' ');
      let next = tokens[i + this.n];

      if (!(gram in this.ngrams)) {
        this.ngrams[gram] = [];
      }

      this.ngrams[gram].push(next);
    }
  }

  generate(min) {
    let gram = choice(this.startwords);
    let sentance;
    if (this.n > 1) {
      sentance = gram.split(' ');
    } else {
      sentance = [gram];
    }
    while (gram in this.ngrams) {
      let possibleNext = this.ngrams[gram];
      sentance.push(choice(possibleNext));

      gram = sentance.slice(-this.n).join(' ');

      if (gram in this.terminals) {
        break;
      }
    }

    let numCharacters = sentance.reduce((total, word) => {
      return total + word.length + 2
    }, 0);
    // At least min words but under 140 characters 
    if (sentance.length < min || numCharacters > 140) {
      return this.generate(min);
    }

    return sentance;
  }
}

const choice = arr => {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const tokenize = str => {
  let cleanedStr = str.replace(/&amp;/g, '&').replace(/\r?\n|\r/g, '');
  return tweetTokenizer
    .tokenize(cleanedStr)
    .filter(token => !token.startsWith('http'))
    .map(token => token.toLowerCase());
};

module.exports = Markov;
