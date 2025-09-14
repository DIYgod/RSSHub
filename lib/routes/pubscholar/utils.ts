import crypto from 'node:crypto';
import CryptoJS from 'crypto-js';

const salt = '6m6pingbinwaktg227gngifoocrfbo95';
const key = CryptoJS.enc.Utf8.parse('eRtYuIoPaSdFgHqW');
const iv = CryptoJS.enc.Utf8.parse('Nmc09JkLzX8765Vb');

export const baseUrl = 'https://pubscholar.cn';
export const sha1 = (str: string) => crypto.createHash('sha1').update(str).digest('hex');
export const uuidv4 = () => crypto.randomUUID();

const generateNonce = (length: number): string => {
    if (!length) {
        return null;
    }

    let nonce = '';
    while (nonce.length < length) {
        const randomString = Math.random().toString(36).slice(2).toUpperCase();
        nonce += randomString;
    }

    return nonce.slice(0, length);
};

/**
 * Part of fingerprint2.js shim from uBlock Origin
 * Taken from https://github.com/gorhill/uBlock/blob/master/src/web_accessible_resources/fingerprint2.js
 * @param len
 * @returns
 */
const hex32 = (len) =>
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        .toString(16)
        .slice(-len)
        .padStart(len, '0');

export const getSignedHeaders = () => {
    const nonce = generateNonce(6);
    const timestamp = Date.now().toString();
    const signature = sha1([salt, timestamp, nonce].toSorted().join(''));
    return {
        nonce,
        timestamp,
        signature,
        'x-finger': `${hex32(8)}${hex32(8)}${hex32(8)}${hex32(8)}`,
    };
};

export const getArticleLink = (id: string) => {
    const ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(id), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).ciphertext.toString();
    return ciphertext;
};
