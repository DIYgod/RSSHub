const decodeCFEmail = (encoded) => {
    const parseHex = (string, position) => Number.parseInt(string.slice(position, position + 2), 16);
    let decoded = '';
    const key = parseHex(encoded, 0);
    for (let position = 2; position < encoded.length; position += 2) {
        const byte = parseHex(encoded, position) ^ key;
        decoded += String.fromCharCode(byte);
    }
    return decoded;
};

const encodeCFEmail = (email) => {
    const key = Math.floor(Math.random() * 256);
    let encoded = ('0' + key.toString(16)).slice(-2);
    for (let position = 0; position < email.length; position++) {
        const byte = email.charCodeAt(position) ^ key;
        encoded += ('0' + byte.toString(16)).slice(-2);
    }
    return encoded;
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
    /**
     * Returns CloudFlare protected email address.
     * @param {String} email - email in plaintext
     * @returns obfuscated email
     */
    encodeCFEmail,
};
