import CryptoJS from 'crypto-js';

const secret = CryptoJS.enc.Utf8.parse('r4rt5A8L6ye6ts8y');
const iv = CryptoJS.enc.Utf8.parse('fs0Hkjg8a23u8sE0');

export const encrypt = (plainText) =>
    CryptoJS.AES.encrypt(plainText, secret, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

export const decrypt = (encrypted) =>
    CryptoJS.AES.decrypt(encrypted, secret, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
