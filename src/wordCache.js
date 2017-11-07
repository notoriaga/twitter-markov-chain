const START = '__START';
const END = '__END';

const buildWordCache = tweets => {
  let wordCache = tweets.reduce((wordCache, tweet) => {
    let sentence = parseTweet(tweet);
    let word;
    let prevWord = START;
    for (var i = 0; i <= sentence.length; i++) {
      wordCache[prevWord] = wordCache[prevWord] || {};
      wordCache[prevWord].count = (wordCache[prevWord].count | 0) + 1;
      wordCache[prevWord].nextWords = wordCache[prevWord].nextWords || {};
      wordCache[prevWord].originalWords = wordCache[prevWord].originalWords || {};
      word = sentence[i];
      if (i === sentence.length || isEndPunc(word)) {
        wordCache[prevWord].nextWords[END] = wordCache[prevWord].nextWords[END] | 0;
        wordCache[prevWord].nextWords[END]++;
        wordCache[END] = wordCache[END] || {};
        wordCache[END].count = (wordCache[END].count | 0) + 1;
        wordCache[END].nextWords = wordCache[END].nextWords || {};
        wordCache[END].originalWords = wordCache[END].originalWords || {};
        prevWord = START;
      } else {
        let parsedWord = parseWord(word);
        if (parsedWord) {
          wordCache[prevWord].nextWords[parsedWord] =
            wordCache[prevWord].nextWords[parsedWord] | 0;
          wordCache[prevWord].nextWords[parsedWord]++;
          wordCache[parsedWord] = wordCache[parsedWord] || {};
          wordCache[parsedWord].count = wordCache[parsedWord].count | 0;
          wordCache[parsedWord].originalWords = wordCache[parsedWord].originalWords || {};
          wordCache[parsedWord].originalWords[word] =
            wordCache[parsedWord].originalWords[word] | 0;
          wordCache[parsedWord].originalWords[word]++;
          prevWord = parsedWord;
        }
      }
    }
    return wordCache;
  }, {});

  Object.keys(wordCache).forEach(word => {
    let node = wordCache[word];
    let cumulativeFrequency = Object.keys(node.nextWords).reduce((sum, nextWord) => {
      let freq = node.nextWords[nextWord];
      return sum + freq;
    }, 0);
    Object.keys(node.nextWords).reduce((sum, nextWord) => {
      let freq = node.nextWords[nextWord];
      sum += freq;
      node.nextWords[nextWord] = {
        word: nextWord,
        frequency: freq,
        weight: freq / cumulativeFrequency,
        cumulativeWeight: sum / cumulativeFrequency,
        node: wordCache[nextWord]
      };
      return sum;
    }, 0);
  });

  return wordCache;
};

const generateTweet = wordCache => {
  const chooseNext = word => {
    let node = wordCache[word];
    let r = Math.random();
    let nextWords = node.nextWords;
    let nextWordList = Object.keys(nextWords);
    for (let i = 0; i < nextWordList.length; i++) {
      let nextWord = nextWordList[i];
      let nextWordInfo = nextWords[nextWord];
      if (nextWordInfo.cumulativeWeight >= r) {
        return nextWord;
      }
    }
  };
  let word = START;
  let tweet = [];
  for (let n = 0; n < 30; n++) {
    let prevWord = word;
    word = chooseNext(prevWord);
    if (word === END) {
      if (n < 3) {
        word = prevWord;
      } else {
        break;
      }
    }
    if (word !== START) {
      tweet.push(word);
    }
  }
  console.log(tweet)
  return toOriginalWords(tweet, wordCache)
    .reduce((str, word) => {
      return ['.', '?', '!', ',', ':'].includes(word) ? str + word : str + ' ' + word;
    }, '')
    .trim();
};

const toOriginalWords = (tweet, wordCache) => {
  const chooseOriginal = choices => {
    let wordList = Object.keys(choices);
    let wordCount = Object.values(choices).reduce((a, b) => a + b, 0);
    let r = Math.random() * wordCount;
    let s = 0;
    for (let [word, count] of Object.entries(choices)) {
      s += count;
      if (r < s) {
        return word;
      }
    }
    return wordList[0];
  };

  return tweet.map(word => {
    let choices = wordCache[word].originalWords;
    return chooseOriginal(choices)
  })
};

const parseTweet = tweet => {
  let words = tweet
    .split(' ')
    .filter(word => !word.match(/^@(.+?)$/gi))
    .filter(word => !word.match(/^http(s?)\:(.+)$/gi))
    .join(' ')
    .replace(/([\.,:;!\+&]+)/gi, ' $1 ')
    .replace(/\s+/gi, ' ')
    .split(' ')
    .filter(word => !!word);
  return words;
};

const parseWord = word => {
  return word.toLowerCase().replace(/[\-'"]/gi, '');
};

const isEndPunc = token => {
  return ['.', '?', '!'].includes(token);
};

module.exports = {
  buildWordCache: buildWordCache,
  generateTweet: generateTweet
};
