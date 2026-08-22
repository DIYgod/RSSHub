import { randomBytes, randomInt, randomUUID } from 'node:crypto';

import sanitizeHtml from 'sanitize-html';

import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';

export const apiRoot = 'https://api-h5.soulapp.cn';
const shareRoot = 'https://w3.soulsmile.cn/activity/#/web/topic/detail';

const device = {
    ua: 'Soul_New/6.32.0 (iPhone; iOS 27.0; Scale/3.00; CFNetwork; iPhone18,2) SoulBegin-iOS-6.32.0-WIFI-SoulEnd',
    aid: '10000001',
    av: '6.32.0',
    avc: '260813221000',
    di: randomUUID().toUpperCase(),
    sdi: randomBytes(16).toString('hex'),
};

const sortByCodeUnit = (a: string, b: string) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};

const encodeTimestamp = (hex8: string, table: number[]) => {
    const permuted = table.map((t) => hex8[t - 1]).join('');
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(Number.parseInt(permuted, 16));
    return buffer;
};

const signCs = (timestampSec: number, str1: string, str2: string) => {
    const checkStatus = 0x80;
    const s = Buffer.alloc(36);
    s[0] = 2;
    s[1] = checkStatus;

    const th = timestampSec.toString(16).padStart(8, '0');
    const e1 = encodeTimestamp(th, [4, 2, 7, 6, 5, 1, 8, 3]);
    const e2 = encodeTimestamp(th, [2, 5, 3, 8, 7, 1, 6, 4]);

    const m1 = Buffer.from(md5(str2 + 'SoulPowerful'), 'hex');
    for (let i = 0; i < 4; i++) {
        s[2 + 2 * i] = m1[i];
        s[3 + 2 * i] = e1[i];
    }

    const m2 = Buffer.from(md5(str1 + e2.toString('hex') + 'kG@yGB9'), 'hex');
    for (let i = 0; i < 4; i++) {
        s[12 + i] = m2[i];
    }

    Buffer.from(s.subarray(0, 16).toString('hex'), 'latin1').copy(s, 0);

    s[20] = 0x30 + randomInt(0, 10);
    s[21] = 0x30 + randomInt(0, 10);
    s[22] = 0x30 + randomInt(0, 10);
    s[23] = s[22];

    Buffer.from(randomBytes(2).toString('hex'), 'latin1').copy(s, 32);

    return s.toString('latin1');
};

export const signedHeaders = (path: string, query: Record<string, string>) => {
    const ms = Date.now();
    const str1 = `${path}?${Object.keys(query)
        .toSorted(sortByCodeUnit)
        .map((k) => `${k}=${query[k]}`)
        .join('&')}`;
    const headers: Record<string, string> = {
        'User-Agent': device.ua,
        aid: device.aid,
        at: ms.toString(16),
        av: device.av,
        di: device.di,
        sdi: device.sdi,
    };
    const str2 = Object.keys(headers)
        .toSorted(sortByCodeUnit)
        .map((k) => headers[k])
        .join('');
    return {
        ...headers,
        avc: device.avc,
        platform: 'iOS',
        cs: signCs(Math.floor(ms / 1000), str1, str2),
    };
};

export const parsePost = (item) => {
    const pureContent = item.content;
    let content = pureContent.replaceAll('\n', '<br />');

    if (item.attachments) {
        for (const attachment of item.attachments) {
            switch (attachment.type) {
                case 'IMAGE':
                    content += '<br />';
                    content += `<img src="${attachment.fileUrl}" />`;
                    break;

                case 'VIDEO':
                    content += '<br />';
                    content += `<video controls src="${attachment.fileUrl}" width="640" height="360"></video>`;
                    break;

                case 'AUDIO':
                    content += '<br />';
                    content += `<audio controls src="${attachment.fileUrl}"></audio>`;
                    break;

                // case 'TEXT':
                // case 'LINK':
                // case 'EXPRESSION':
                // case 'TUYA':

                default:
                    throw new Error(`Unknown attachment type: ${attachment.type}`);
            }
        }
    }

    return {
        title: `「${item.signature}」的瞬间：${sanitizeHtml(pureContent.split('\n', 1)[0], { allowedTags: [], allowedAttributes: {} })}`,
        author: item.signature,
        description: content,
        category: item.innerTags?.map((tag) => `${tag.name} (${tag.tagIdEcpt})`),
        pubDate: parseDate(item.createTime),
        guid: item.postIdEcpt,
        link: `${shareRoot}?postIdEcpt=${item.postIdEcpt}`,
    };
};
