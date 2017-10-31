const casual = require('talisman/tokenizers/tweets/casual');

const choice = arr => {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const tokenize = str => {
  return casual(str).filter(token => !token.startsWith('http'));
};

module.exports = {
  Generator: function(n, max) {
    this.n = n;
    this.max = max;
    this.ngrams = {};
    this.beginnings = [];

    this.feed = text => {
      let tokens = casual(text);
      console.log(text, tokens);
      if (tokens.length < this.n) {
        return false;
      }

      let beginning = tokens.slice(0, this.n).join(' ');
      this.beginnings.push(beginning);

      for (let i = 0; i < tokens.length - this.n; i++) {
        gram = tokens.slice(i, i + this.n).join(' ');
        next = tokens[i + this.n];

        if (!this.ngrams[gram]) {
          this.ngrams[gram] = [];
        }

        this.ngrams[gram].push(next);
      }
    };

    this.generate = () => {
      let current = choice(this.beginnings);
      let output = casual(current);

      for (let i = 0; i < this.max; i++) {
        if (this.ngrams[current]) {
          let possible_next = this.ngrams[current];
          let next = choice(possible_next);
          output.push(next);
          current = output.slice(output.length - this.n, output.length).join(' ');
        } else {
          break;
        }
      }
      return output.join(' ');
    };
  }
};
