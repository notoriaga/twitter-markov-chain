//const salient = require('salient');
//const tweetTokenizer = new salient.tokenizers.TweetTokenizer();

module.exports = class Markov {
  constructor(n) {
    this.startwords = [];
    this.terminals = {};
    this.ngrams = {};
    this.n = n;
  }

  feed(sentence) {
    let tokens;
    if (sentence instanceof Array) {
      tokens = sentence;
    } else {
      //tokens = tokenize(sentence);
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
    let sentence;
    if (this.n > 1) {
      sentence = gram.split(' ');
    } else {
      sentence = [gram];
    } 
    while (gram in this.ngrams) {
      let possibleNext = this.ngrams[gram];
      sentence.push(choice(possibleNext));

      gram = sentence.slice(-this.n).join(' ');

      if (gram in this.terminals) {
        break;
      }
    }

    if (sentence.length < min) {
      return this.generate(min);
    }

    return sentence;
  }
};

const choice = arr => {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

// const tokenize = str => {
//   let cleanedStr = str.replace(/&amp;/g, '&').replace(/\r?\n|\r/g, '');
//   return tweetTokenizer
//     .tokenize(cleanedStr)
//     .filter(token => !token.startsWith('http'))
//     .map(token => token.toLowerCase());
// };
