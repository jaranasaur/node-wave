const fs = require('fs');
const { createWavFileBuffer } = require('./index');

// create audio folder if it doesn't exist
const audioFolder = './audio';
if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder);
}

const testCases = [
  { sampleRate: 48000, bitDepth: 24 },
  // { sampleRate: 48000, bitDepth: 16 },
  // { sampleRate: 48000, bitDepth: 8 },
];

const numberOfChannels = 1;
const signalLength = 3600; // length of file in seconds
const periodLength = 1 / 4000; // length of time of 1 period

testCases.forEach((testCase, index) => {
  runTest(testCase.sampleRate, testCase.bitDepth, index);
});

function runTest(sampleRate, bitDepth, index) {
  const startTime = Date.now();
  
  const bytesPerSample = bitDepth / 8;
  const samples = new Uint8Array(sampleRate * bytesPerSample * signalLength);

  const sampleLength = 1 / sampleRate; // length of time between samples
  const sineStep = (sampleLength / periodLength) * Math.PI * 2; // value to pass to sine function
  
  const quantize = createQuantizer(bitDepth);

  const sampleBuffer = new Uint8Array(bytesPerSample);
  
  for (let i = 0; i < samples.byteLength; i += bytesPerSample) {
    const realVal = Math.sin((i/bytesPerSample) * sineStep) * 1;
    const quantizedVal = quantize(realVal);

    // let le = _toLittleEndian(quantizedVal, bytesPerSample);
    // for (let ii = 0; ii < le.length; ii += 1) {
    //   samples[i + ii] = le[ii];
    // }
    _toLittleEndian(quantizedVal, sampleBuffer);
    samples.set(sampleBuffer, i);
    // for (let ii = 0; ii < sampleBuffer.byteLength; ii += 1) {
    //   samples[i + ii] = sampleBuffer[ii];
    // }
  }
  
  fs.writeFileSync(`${audioFolder}/test-${sampleRate}-${bitDepth}.wav`, createWavFileBuffer(numberOfChannels, sampleRate, bitDepth, samples));
  
  console.log(`test ${index} finished in: ${Date.now() - startTime} ms`);
}

function _toLittleEndian(decimalValue, sampleBuffer) {
  for (let i = 0; i < sampleBuffer.byteLength; i += 1) {
    sampleBuffer[i] = (decimalValue | -256) & 255;
    decimalValue = decimalValue >>> 8;
  }
}

// function _toLittleEndian(decimalValue, byteCount) {
//   const returnArr = [];
//   for (let i = 0; i < byteCount; i += 1) {
//     returnArr.push((decimalValue | -256) & 255);
//     decimalValue = decimalValue >>> 8;
//   }
//   return returnArr;
// }

function createQuantizer(bitDepth) {
  const maxUInt = Math.pow(2, bitDepth) - 1;
  const maxInt = (maxUInt + 1) / 2 - 1;
  const maxInt1 = maxInt + 1;

  return bitDepth > 8
    ? val => Math.round(val * maxInt)
    : val => Math.round(val * maxInt) + maxInt1;
}