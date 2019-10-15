const fs = require('fs');
const { createWavFileBuffer } = require('./waveNew');

// create audio folder if it doesn't exist
const audioFolder = './audio';
if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder);
}

const sampleRate = 48000;
const numberOfChannels = 1;
const bitDepth = 24;

const bytesPerSample = bitDepth / 8;

const samples = new Uint8Array(sampleRate * bytesPerSample);

const sampleLength = Math.PI * 2 / 440;

const maxUInt = Math.pow(2, bitDepth) - 1;
const maxInt = (maxUInt + 1) / 2;

// calculate floating point samples
for (let i = 0; i < samples.byteLength; i += bytesPerSample) {
  realVal = Math.sin(i * sampleLength);
  quantizedVal = Math.round(realVal * maxUInt);
  le = _toLittleEndian(quantizedVal - maxInt, bytesPerSample);
  for (let ii = 0; ii < le.length; ii += 1) {
    samples[i + ii] = le[ii];
  }
}

fs.writeFileSync(`${audioFolder}/file2.wav`, createWavFileBuffer(numberOfChannels, sampleRate, bitDepth, samples));
createWavFileBuffer()
function _toLittleEndian(decimalValue, byteCount) {
  const returnArr = [];
  for (let i = 0; i < byteCount; i += 1) {
    returnArr.push((decimalValue | -256) & 255);
    decimalValue = decimalValue >>> 8;
  }
  return returnArr;
}