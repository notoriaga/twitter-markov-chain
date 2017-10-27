Array.prototype.choice = function() {
  let i = Math.floor(Math.random() * this.length);
  return this[i];
};

String.prototype.tokenize = function() {
  return this.replace(/[.\"\/!$%\^&\*;{}=\-//_`~():—,?]/g, '')
    .replace(/\s{2,}/g, ' ')
    .split(/\s+/)
    .map(word => {
      return word.toLowerCase();
    })
    .filter(word => {
      return !/(http)/.test(word);
    });
};

module.exports = {
  Generator: function(n, max) {
    this.n = n;
    this.max = max;
    this.ngrams = {};
    this.beginnings = [];

    this.feed = function(text) {
      let tokens = text.tokenize();

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

    this.generate = function() {
      //      let current = this.beginnings.choice();
      let current = Object.keys(this.ngrams).choice();
      let output = current.tokenize();

      for (let i = 0; i < this.max; i++) {
        if (this.ngrams[current]) {
          let possible_next = this.ngrams[current];
          let next = possible_next.choice();
          output.push(next);
          current = output
            .slice(output.length - this.n, output.length)
            .join(' ');
        } else {
          break;
        }
      }
      return output.join(' ');
    };
  }
};
