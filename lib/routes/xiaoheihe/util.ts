// Copied from https://github.com/huandu/heybox-url

import { md5 } from '@/utils/hash';

const dict = 'JKMNPQRTX1234OABCDFG56789H';

function c0(v) {
    return c1(v) ^ c2(v) ^ c3(v);
}

function c1(v) {
    return c2(c3(convertByte(v)));
}

function c2(v) {
    return c3(convertByte(v));
}

function c3(v) {
    return convertByte(v) ^ v;
}

function convertByte(v) {
    return v & 0x80 ? 0xff & ((v << 1) ^ 0x1b) : v << 1;
}

/**
 * Calculate checksum for a 4-byte data.
 * @param {number[]} data
 * @returns {number}
 */
const checksum = (data) =>
    [c0(data[0]) ^ c1(data[1]) ^ c2(data[2]) ^ c3(data[3]), c3(data[0]) ^ c0(data[1]) ^ c1(data[2]) ^ c2(data[3]), c2(data[0]) ^ c3(data[1]) ^ c0(data[2]) ^ c1(data[3]), c1(data[0]) ^ c2(data[1]) ^ c3(data[2]) ^ c0(data[3])].reduce(
        (prev, value) => prev + value
    ) % 100;

export const calculate = (url, timestamp = 0, nonce = '') => {
    timestamp ||= Math.trunc(Temporal.Now.instant().epochMilliseconds / 1000);
    nonce ||= md5(Math.random().toString()).toUpperCase();

    const { pathname } = new URL(url);
    const ts = timestamp + 1;
    const u = '/' + pathname.split('/').filter(Boolean).join('/') + '/';

    let key = '';
    const nonceHash = md5((nonce + dict).replaceAll(/\D/g, '')).toLowerCase();
    const rnd = md5(ts + u + nonceHash)
        .replaceAll(/\D/g, '')
        .slice(0, 9)
        .padEnd(9, '0');

    for (let c = +rnd, i = 0; i < 5; i++) {
        const u = c % dict.length;
        c = Math.trunc(c / dict.length);
        key += dict[u];
    }

    const suffix = checksum(Array.from(key.slice(-4), (c) => c.codePointAt(0)))
        .toString()
        .padStart(2, '0');

    const query = `hkey=${key}${suffix}&_time=${timestamp}&nonce=${nonce}`;
    const urlObj = new URL(url);
    urlObj.search += urlObj.search ? '&' + query : query;
    return urlObj.href;
};
