const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const { KJUR, KEYUTIL, hextob64 } = require('jsrsasign');

const publicKey =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCARnxLlrhTK28bEV7s2IROjT73KLSjfqpKIvV8L+Yhe4BrF0Ut4oOH728HZlbSF0C3N0vXZjLAFesoS4v1pYOjVCPXl920Lh2seCv82m0cK78WMGuqZTfA44Nv7JsQMHC3+J6IZm8YD53ft2d8mYBFgKektduucjx8sObe7eRyoQIDAQAB';

const randomString = (length) => {
    if (length > 32) {
        throw Error('Max length is 32.');
    }
    return uuidv4().replace(/-/g, '').substring(0, length);
};

const uuidv4 = () => crypto.randomUUID();

/**
 * @param {string} str
 * @returns {CryptoJS.lib.WordArray}
 */
const MD5 = (str) => CryptoJS.MD5(str);

const encryptAES = (data, key) => {
    if (typeof key === 'string') {
        key = MD5(key);
    }
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();
};

const decryptAES = (data, key) => {
    if (typeof key === 'string') {
        key = MD5(key);
    }
    return CryptoJS.AES.decrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
};

const encryptRSA = (data) => {
    // Original code:
    // var n = new JSEncrypt();
    // n.setPublicKey(pubKey);
    // return n.encrypt(message);
    // Note: Server will reject the public key if it's encrypted using crypto.publicEncrypt().
    let pubKey = `-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`;
    pubKey = KEYUTIL.getKey(pubKey);
    return hextob64(KJUR.crypto.Cipher.encrypt(data, pubKey));
};

const getHeaders = (key) => {
    const fingerPrint = uuidv4();

    return {
        'content-type': 'application/json',
        'ovse-trace': uuidv4(),
        callertype: 'USER',
        fingerprint: encryptAES(fingerPrint, MD5(key)),
        onetimeskey: encryptRSA(key),
        timestamp: encryptAES(Date.now(), key),
        referer: 'https://www.ainvest.com/',
    };
};

module.exports = {
    randomString,
    encryptAES,
    decryptAES,
    getHeaders,
};
