const neataptic = require('neataptic');
const fs = require('fs');

let tweets = Array.from(fs.readFileSync('tweets', 'utf8').toLowerCase());
let characters = [...new Set(tweets)];

let onehot = characters.reduce((onehot, char, index) => {
  let zeros = Array(characters.length).fill(0);
  zeros[index] = 1;
  onehot[characters[index]] = zeros;
  return onehot;
}, {});

let dataSet = [];

let previous = tweets[0];
for (let i = 1; i < tweets.length; i++) {
  let next = tweets[i];
  dataSet.push({ input: onehot[previous], output: onehot[next] });
  previous = next;
}

function writeSentence(network) {
  outputText = '';

  var output = network.activate(dataSet[0].input);
  outputText = outputText + tweets[0];

  for (var i = 0; i < 140; i++) {
    var max = Math.max.apply(null, output);
    var index = output.indexOf(max);

    var zeros = Array.apply(null, Array(characters.length)).map(
      Number.prototype.valueOf,
      0
    );
    zeros[index] = 1;

    var character = Object.keys(onehot).find(
      key => onehot[key].toString() === zeros.toString()
    );

    outputText = outputText + character;

    output = network.activate(zeros);
  }
  console.log(outputText);
}

// let network = new neataptic.architect.LSTM(characters.length, 4, 4, characters.length);
let net = require('../model.json');
console.log(net)
//console.log(JSON.stringify(net));
let network = neataptic.Network.fromJSON(net);
//console.log('Network conns', network.connections.length, 'nodes', network.nodes.length);
//console.log('Dataset size:', dataSet.length);
//console.log('Characters:', Object.keys(onehot).length);

// network.train(dataSet, {
//   log: 1,
//   rate: 0.1,
//   cost: neataptic.methods.cost.MSE,
//   error: 0.005,
//   clear: true,
//   iterations: 100,
// });

// let exported = network.toJSON();
// fs.writeFileSync('model.json', JSON.stringify(exported));

writeSentence(network);
