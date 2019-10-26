const fs = require('fs');
const { createWavFileBuffer } = require('./index');

const startTime = Date.now();

// create audio folder if it doesn't exist
const audioFolder = './audio';
if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder);
}

const sampleRate = 48000;
const numberOfChannels = 1;
const bitDepth = 8;
const signalLength = 1; // length of file in seconds

const bytesPerSample = bitDepth / 8;

const samples = new Uint8Array(sampleRate * bytesPerSample * signalLength);

const sampleLength = 1 / sampleRate; // length of time between samples
const periodLength = 1 / 440; // length of time of 1 period
const sineStep = (sampleLength / periodLength) * Math.PI * 2; // value to pass to sine function

const quantize = createQuantizer(bitDepth);

for (let i = 0; i < samples.byteLength; i += bytesPerSample) {
  const realVal = Math.sin((i/bytesPerSample) * sineStep) * .5;
  const quantizedVal = quantize(realVal);
  let le = _toLittleEndian(quantizedVal, bytesPerSample);
  for (let ii = 0; ii < le.length; ii += 1) {
    samples[i + ii] = le[ii];
  }
}

fs.writeFileSync(`${audioFolder}/file2.wav`, createWavFileBuffer(numberOfChannels, sampleRate, bitDepth, samples));

console.log(`finished in: ${Date.now() - startTime} ms`);

function _toLittleEndian(decimalValue, byteCount) {
  const returnArr = [];
  for (let i = 0; i < byteCount; i += 1) {
    returnArr.push((decimalValue | -256) & 255);
    decimalValue = decimalValue >>> 8;
  }
  return returnArr;
}

function createQuantizer(bitDepth) {
  const maxUInt = Math.pow(2, bitDepth) - 1;
  const maxInt = (maxUInt + 1) / 2 - 1;
  const maxInt1 = maxInt + 1;

  return bitDepth > 8
    ? val => Math.round(val * maxInt)
    : val => Math.round(val * maxInt) + maxInt1;
}