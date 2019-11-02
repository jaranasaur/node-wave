class Helper {
  /**
   * Converts decimal number to a byte array of specified length in little-endian order
   * @param {number} decimalValue The decimal value to convert
   * @param {number} byteCount The number of bytes to convert to (if byte count is too small, the most significant bytes are lost)
   */
  static toLittleEndian(decimalValue, byteCount) {
    const returnArr = [];
    for (let i = 0; i < byteCount; i += 1) {
      returnArr.push((decimalValue | -256) & 255);
      decimalValue = decimalValue >>> 8;
    }
    return returnArr;
  }

  static decodeBytes(bytes, offset, length) {
    let hexString = `0x`;
    for (let i = offset + length - 1; i >= offset; i -= 1) {
      hexString = `${hexString}${bytes[i].toString(16).padStart(2, '0')}`;
    }
    return parseInt(hexString);
  }
}

module.exports = Helper;