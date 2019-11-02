const fs = require('fs');
const { toLittleEndian, decodeBytes } = require('./helpers/Helper');

/**
 * Creates a Uint8Array in WAV audio file format
 * @param {number} numChannels Number of audio channels (1 for mono, 2 for stereo, etc.)
 * @param {number} sampleRate Number of samples of audio per second (44100, 48000, etc.)
 * @param {number} bitsPerSample Size of each sample in number of bits (8, 16, 24, etc.)
 * @param {Uint8Array} samples Byte array containing audio sample data
 * @param {Object} [options] Additional options
 * @param {boolean} options.reverseSampleByteOrder Reverses the byte order for each sample. Converts from big-endian to little-endian and vice versa
 * @returns {Uint8Array}
*/
function createWavFileBuffer(numChannels, sampleRate, bitsPerSample, samples, options = { reverseSampleByteOrder: false }) { 
  const headerSize = 44;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  // uint array to store all the data (44 bytes for header and metadata)
  const wavBuffer = new Uint8Array(headerSize + samples.byteLength);

  // Chunk ID 'RIFF' header
  wavBuffer.set([82, 73, 70, 70], 0);

  // Chunk Size (total number of bytes, not including 'RIFF' & 'WAVE' headers), little-endian
  wavBuffer.set(toLittleEndian(wavBuffer.byteLength - 8, 4), 4);

  // 'WAVEfmt ' header
  wavBuffer.set([87, 65, 86, 69, 102, 109, 116, 32], 8);

  // Sub Chunk 1 Size (value of 16 for PCM), little-endian (leave bytes 17, 18, 19 at 0)
  wavBuffer[16] = 0x10;

  // Audio Format (value of 1 for PCM), little-endian (leave byte 21 at 0)
  wavBuffer[20] = 0x01;

  // Number of Channels, little-endian
  wavBuffer.set(toLittleEndian(numChannels, 2), 22);

  // Sample Rate, little-endian
  wavBuffer.set(toLittleEndian(sampleRate, 4), 24);

  // Byte Rate, little-endian
  wavBuffer.set(toLittleEndian(byteRate, 4), 28);

  // Block Align, little-endian
  wavBuffer.set(toLittleEndian(blockAlign, 2), 32);

  // Bits Per Sample, little-endian
  wavBuffer.set(toLittleEndian(bitsPerSample, 2), 34);

  // Sub Chunk 2 ID (ASCII 'data')
  wavBuffer.set([100, 97, 116, 97], 36);

  // Sub Chunk 2 Size (size of all samples), little-endian
  wavBuffer.set(toLittleEndian(samples.byteLength, 4), 40);

  // Audio samples
  // Reverses the byte order for each sample
  if (options.reverseSampleByteOrder) {
    for (let i = 0; i < samples.byteLength; i += bytesPerSample) {
      // slice 1 sample out of the samples array and reverse it;
      wavBuffer.set(samples.slice(i, i + bytesPerSample).reverse(), i + headerSize);
    }
  } else {
    wavBuffer.set(samples, headerSize);
  }

  return wavBuffer;
}

/**
 * 
 * @param {string} wavFilePath Path to the .wav file
 */
function readWavFile(wavFilePath) {
  const wavFileBuffer = fs.readFileSync(wavFilePath);

  let numChannels, sampleRate, bitsPerSample, samples;

  for (let i = 0; i < wavFileBuffer.byteLength; i += 1) {
    if (wavFileBuffer[i] == "f".charCodeAt(0)) {
      if (wavFileBuffer[i + 1] == "m".charCodeAt(0)) {
        if (wavFileBuffer[i + 2] == "t".charCodeAt(0)) {
          if (wavFileBuffer[i + 3] == " ".charCodeAt(0)) {
            // if PCM audio
            if (decodeBytes(wavFileBuffer, i + 8, 2) == 1) {
              numChannels = decodeBytes(wavFileBuffer, i + 10, 2);
              sampleRate = decodeBytes(wavFileBuffer, i + 12, 4);
              bitsPerSample = decodeBytes(wavFileBuffer, i + 22, 4);
            }
          }
        }
      }
    }
  }

  return { numChannels, sampleRate, bitsPerSample, samples };
}

module.exports = { createWavFileBuffer, readWavFile };
