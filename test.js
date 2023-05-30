const fs = require('fs');
const ipa_one_syllable = JSON.parse(fs.readFileSync('_ipa_one_syllable.json'));
const ipa_all_names = JSON.parse(fs.readFileSync('_ipa_all_names.json'));





function convert(word){
  // Example: querying for a word and getting the pronunciation
  for (const entry of ipa_one_syllable) {
    if (entry[0] === word) {
      const pronunciation = entry[1];
      return pronunciation;
    }
  }
  return word + "*"
}







function hailMary(word){
  // Example: querying for a word and getting the pronunciation

  for (const entry of ipa_all_names) {
    if (entry[0] === word) {
      const pronunciation = entry[1];
      return pronunciation;
    }
  }
  return word + "*"
}






// Array of one-syllable words
const words = [
  'cat', 'weymouth', 'bat', 'sun', 'pen',
  'cup', 'mat', 'man', 'fan', 'hat',
  'map', 'jam', 'pig', 'pen', 'top',
  'hop', 'hot', 'nut', 'net', 'rat'
];

// Convert each word to IPA using the convertToIPA function
const ipaWords = words.map(word => hailMary(word));

// Print the converted words
console.log(ipaWords);