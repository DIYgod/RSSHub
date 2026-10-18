/* oxlint-disable unicorn/prefer-code-point */
const decodeCFEmail = (encoded) => {
    const parseHex = (position) => Number.parseInt(encoded.slice(position, position + 2), 16);
    let decoded = '';
    const key = parseHex(0);
    for (let position = 2; position < encoded.length; position += 2) {
        const byte = parseHex(position) ^ key;
        decoded += String.fromCharCode(byte);
    }
    return decoded;
};

/**
 * The alogrithm is well-explained in https://andrewlock.net/simple-obfuscation-of-email-addresses-using-javascript/
 */
export {
    /**
     * Returns decoded email address using CloudFlare's email address obfuscation.
     * @param {String} encoded - encoded email, (`cfemail` attribute in `__cf_email__` tag)
     * @returns decoded email address
     */
    decodeCFEmail,
};
