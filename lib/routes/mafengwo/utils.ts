import { randomBytes } from 'node:crypto';

import CryptoJS from 'crypto-js';

import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

// ?v=vc1jasc
const key = CryptoJS.enc.Utf8.parse('tg09It3*9h');

/**
 * `w_tsfp`=`base64(RC4(key, payload))`
 */
const generateWTsfp = (url: string) => {
    const now = Date.now();
    const fingerprint = randomBytes(16).toString('hex');
    const salt = randomBytes(16).toString('hex');
    const payload = JSON.stringify({
        timestamp: now,
        basets: now,
        loadts: now,
        fingerprint,
        abnormal: '0'.repeat(32),
        referer: encodeURIComponent('https://www.mafengwo.cn/'),
        uri: encodeURIComponent(url),
        checksum: md5(url + fingerprint + salt + now),
    });
    const token = CryptoJS.RC4.encrypt(CryptoJS.enc.Utf8.parse(payload), key).ciphertext.toString(CryptoJS.enc.Base64);

    return `x-waf-captcha-referer=; w_tsfp=${token}`;
};

export const wafFetch = <T>(url: string): Promise<T> => ofetch<T>(url, { headers: { cookie: generateWTsfp(url) } });
