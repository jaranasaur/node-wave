const fs = require('fs');
const { readWavFile } = require('../index');

const stuff = readWavFile(fs.readFileSync('c:/users/jared/desktop/RhythmL_34.wav'));
console.log(stuff);