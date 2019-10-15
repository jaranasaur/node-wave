/**
 * Creates a Uint8Array in WAV audio file format
 * @param {number} numChannels Number of audio channels (1 for mono, 2 for stereo, etc.)
 * @param {number} sampleRate Number of samples of audio per second
 * @param {number} bitsPerSample Size of each sample in number of bits
 * @param {Uint8Array} samples Byte array containing audio samples
 * @param {Object} [options] Additional options
 * @param {boolean} options.toLittleEndian Converts samples from big-endian byte order to little-endian byte
 * @returns {Uint8Array}
*/
function createWavFileBuffer(numChannels, sampleRate, bitsPerSample, samples, options = { toLittleEndian: false }) { 
  const headerSize = 44;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  // uint array to store all the data (44 bytes for header and metadata)
  const wavBuffer = new Uint8Array(headerSize + samples.byteLength);

  // Chunk ID 'RIFF' header
  wavBuffer.set([82, 73, 70, 70], 0);

  // Chunk Size (total number of bytes, not including 'RIFF' & 'WAVE' headers), little-endian
  wavBuffer.set(_toLittleEndian(wavBuffer.byteLength - 8, 4), 4);

  // 'WAVEfmt ' header
  wavBuffer.set([87, 65, 86, 69, 102, 109, 116, 32], 8);

  // Sub Chunk 1 Size (value of 16 for PCM), little-endian (leave bytes 17, 18, 19 at 0)
  wavBuffer[16] = 0x10;

  // Audio Format (value of 1 for PCM), little-endian (leave byte 21 at 0)
  wavBuffer[20] = 0x01;

  // Number of Channels, little-endian
  wavBuffer.set(_toLittleEndian(numChannels, 2), 22);

  // Sample Rate, little-endian
  wavBuffer.set(_toLittleEndian(sampleRate, 4), 24);

  // Byte Rate, little-endian
  wavBuffer.set(_toLittleEndian(byteRate, 4), 28);

  // Block Align, little-endian
  wavBuffer.set(_toLittleEndian(blockAlign, 2), 32);

  // Bits Per Sample, little-endian
  wavBuffer.set(_toLittleEndian(bitsPerSample, 2), 34);

  // Sub Chunk 2 ID (ASCII 'data')
  wavBuffer.set([100, 97, 116, 97], 36);

  // Sub Chunk 2 Size (size of all samples), little-endian
  wavBuffer.set(_toLittleEndian(samples.byteLength * blockAlign, 4), 40);

  // Audio samples
  // convert samples to little-endian
  if (options.toLittleEndian) {
    for (let i = 0; i < samples.byteLength; i += bytesPerSample) {
      // slice 1 sample out of the samples array and reverse it;
      wavBuffer.set(samples.slice(i, i + bytesPerSample).reverse(), i + headerSize);
    }
  } else {
    wavBuffer.set(samples, headerSize);
  }

  return wavBuffer;
}

// converts a decimal number to byte array of specified size in little-endian order and returns it
function _toLittleEndian(decimalValue, byteCount) {
  const returnArr = [];
  for (let i = 0; i < byteCount; i += 1) {
    returnArr.push((decimalValue | -256) & 255);
    decimalValue = decimalValue >>> 8;
  }
  return returnArr;
}

module.exports = { createWavFileBuffer }
