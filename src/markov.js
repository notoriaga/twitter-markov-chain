Array.prototype.choice = function() {
  var i = Math.floor(Math.random() * this.length);
  return this[i];
};

String.prototype.tokenize = function() {
  return this.split(/\s+/);
};

module.exports = {
  Generator: function(n, max) {
    this.n = n;
    this.max = max;
    this.ngrams = {};
    this.beginnings = [];

    this.feed = function(text) {
      var tokens = text.tokenize();

      // Discard this line if it's too short
      if (tokens.length < this.n) {
        return false;
      }

      // Store the first ngram of this line
      var beginning = tokens.slice(0, this.n).join(' ');
      this.beginnings.push(beginning);

      // Now let's go through everything and create the dictionary
      for (var i = 0; i < tokens.length - this.n; i++) {
        // Usings slice to pull out N elements from the array
        gram = tokens.slice(i, i + this.n).join(' ');
        // What's the next element in the array?
        next = tokens[i + this.n];

        // Is this a new one?
        if (!this.ngrams[gram]) {
          this.ngrams[gram] = [];
        }
        // Add to the list
        this.ngrams[gram].push(next);
      }
    };

    this.generate = function() {
      // Get a random beginning
      var current = this.beginnings.choice();

      // The output is now an array of tokens that we'll join later
      var output = current.tokenize();

      // Generate a new token max number of times
      for (var i = 0; i < this.max; i++) {
        // If this is a valid ngram
        if (this.ngrams[current]) {
          // What are all the possible next tokens
          var possible_next = this.ngrams[current];
          // Pick one randomly
          var next = possible_next.choice();
          // Add to the output
          output.push(next);
          // Get the last N entries of the output; we'll use this to look up
          // an ngram in the next iteration of the loop
          current = output
            .slice(output.length - this.n, output.length)
            .join(' ');
        } else {
          break;
        }
      }
      // Here's what we got!
      return output.join(' ');
    };
  }
};
