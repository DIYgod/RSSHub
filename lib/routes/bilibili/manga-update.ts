import { createDecipheriv } from 'node:crypto';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/manga/update/:comicid',
    categories: ['social-media'],
    example: '/bilibili/manga/update/26009',
    parameters: { comicid: '漫画 id, 可在 URL 中找到, 支持带有`mc`前缀' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['manga.bilibili.com/detail/:comicid'],
        },
    ],
    name: '漫画更新',
    maintainers: ['hoilc'],
    handler,
};

const ALPHA62 = 'br5NH9CxpvJzmEt3OqoF7jgWMIZ2UnASfc8K6XaLYylT1eVBGh4sdQkDwRP0ui';
const B64_TABLES = ['UalVqQk8T7+5oJxC6MzIniWDrc3XERGN/wdLyp90mf2tHuvsgeSjZbBF1KAOPhY4', 'zI3XZb8T7+5opF1KJxUaBqQk90mf6MlVCEceSjAOPhY42RGN/wdLytHuvsgniWDr'];
const rotateLeft = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;

/**
 * MD5-shaped block mixer with its own round function and rotation constants
 */
const processBlock = (block: Uint8Array, [a, b, c, d]: number[]) => {
    for (let i = 0; i < 16; i++) {
        const w = block[i * 4] | (block[i * 4 + 1] << 8) | (block[i * 4 + 2] << 16) | (block[i * 4 + 3] << 24);
        a = (a + ((b & c) | (~b & d)) + w) >>> 0;
        b = (b + (c ^ a ^ d) + w) >>> 0;
        c = (c + ((b & a) | (~b & d)) + w) >>> 0;
        d = (d + (c ^ a ^ b) + w) >>> 0;
        a = rotateLeft(a, 5);
        b = rotateLeft(b, 7);
        c = rotateLeft(c, 3);
        d = rotateLeft(d, 11);
    }
    return [a, b, c, d];
};

/**
 * Same as MD5 padding except a length of 55 mod 64 gets a full extra block
 */
const md5v2 = (data: Uint8Array) => {
    const zeros = 64 - ((data.length + 9) % 64);
    const buf = Buffer.alloc(data.length + 1 + zeros + 8);
    buf.set(data);
    buf[data.length] = 0x80;
    buf.writeBigUInt64LE(BigInt(data.length) * 8n, buf.length - 8);
    let state = [0xab_cd_ef_01, 0x12_34_56_78, 0xde_ad_be_ef, 0xfe_ed_ca_fe];
    for (let i = 0; i < buf.length; i += 64) {
        state = processBlock(buf.subarray(i, i + 64), state);
    }
    const hex = state.map((w) => w.toString(16).padStart(8, '0')).join('');
    return Buffer.from([...hex].map((ch) => ALPHA62.codePointAt(ch.codePointAt(0)! % 62)!));
};

/**
 * RC4 with `S[i] ^= i` after each KSA swap and a +1 offset on the keystream index
 */
const xrc4 = (key: number[], data: Uint8Array) => {
    const S = Uint8Array.from({ length: 256 }, (_, i) => i);
    for (let i = 0, j = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key.length]) & 255;
        [S[i], S[j]] = [S[j], S[i]];
        S[i] ^= i;
    }
    const out = Buffer.alloc(data.length);
    for (let n = 0, i = 0, j = 0; n < data.length; n++) {
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;
        [S[i], S[j]] = [S[j], S[i]];
        out[n] = data[n] ^ S[(S[i] + S[j] + 1) & 255];
    }
    return out;
};

const b64V2Enc = (data: Uint8Array, variant: number) => {
    const table = B64_TABLES[variant];
    let out = '';
    for (let i = 0; i < data.length; i += 3) {
        const v = (data[i] << 16) | ((data[i + 1] ?? 0) << 8) | (data[i + 2] ?? 0);
        for (let k = 0; k < 4; k++) {
            out += table[(v >>> (18 - 6 * k)) & 63];
        }
    }
    const rem = data.length % 3;
    return rem ? out + '='.repeat(3 - rem) : out;
};

// Based on https://github.com/SocialSisterYi/bilibili-API-collect/issues/1168#issuecomment-2620749895
// https://s1.hdslb.com/bfs/manga-static/manga-pc/6732b1bf426cfc634293.wasm
export const genReqSign = (query: string, body: string, ts: number) => {
    const params = new URLSearchParams(query);
    const keys = [...new Set(params.keys())].filter((k) => k !== 'ultra_sign').toSorted((a, b) => Number(a > b) - Number(a < b));
    const acc = keys.map((k) => k + params.getAll(k).join('')).join('');
    const bts = BigInt(ts);
    const h1 = md5v2(Buffer.from(acc + bts.toString(16)));
    const h2 = md5v2(Buffer.from(body + (bts / 128n).toString(2)));
    const encBody = b64V2Enc(xrc4([1, 3, 7], Buffer.from(body)), Number(bts % 2n));
    const h3 = md5v2(Buffer.from(encBody));
    const t = Number(bts & 0xff_ff_ff_ffn);
    const buf = Buffer.from([
        1,
        Number((bts >> 23n) & 0xffn),
        Number((bts >> 31n) & 0xffn),
        Number((bts >> 15n) & 0xffn),
        7,
        h1[13],
        h1[23],
        h2[11],
        h2[7],
        h3[23],
        h3[19],
        (t >>> 8) & 255,
        (t >>> 24) & 255,
        (t >>> 16) & 255,
        7,
        0,
        5,
        0,
        4,
        1,
        5,
        0,
        2,
        0,
        1,
        0,
        6,
        2,
        0,
        0,
    ]);
    // oxlint-disable-next-line unicorn/no-array-reduce
    buf[29] = buf.subarray(0, 28).reduce((x, y) => x ^ y, 0);
    const out = Buffer.from([buf[0], buf[1], 0, 0, 0, ...[22, 7, 17, 21, 16, 28, 15, 12, 4, 3, 14, 27, 10, 6, 11, 19, 24, 25, 26, 20, 23, 18, 8, 2].map((i) => buf[i])]);
    const hA = md5v2(Buffer.concat([out, Buffer.from([h1[7], h2[29]])]));
    const hB = md5v2(Buffer.concat([out, Buffer.from([h3[31]])]));
    const sign = Buffer.concat([hA.subarray(0, 24), hB.subarray(0, 24)]);
    // The 11 hex digits of the timestamp are spliced into fixed positions of the digest
    const hex = bts.toString(16);
    for (const [pos, i] of [41, 37, 23, 29, 13, 19, 5, 47, 7, 11, 17].entries()) {
        sign[i] = hex.codePointAt(pos)!;
    }
    return sign.toString('latin1');
};

const decryptBytesData = (bytesData: string, buvid3: string, comicId: string) => {
    const key = Buffer.from(
        [...buvid3]
            .filter((_, i) => i % 2 === 0)
            .join('')
            .slice(0, 18) +
            'web' +
            comicId.slice(-3)
    );
    const decipher = createDecipheriv('aes-192-cbc', key, key.subarray(0, 16));
    const plain = Buffer.concat([decipher.update(Buffer.from(bytesData, 'base64')), decipher.final()]);
    return JSON.parse(plain.toString());
};

async function handler(ctx) {
    const comic_id = ctx.req.param('comicid').startsWith('mc') ? ctx.req.param('comicid').replace('mc', '') : ctx.req.param('comicid');
    const link = `https://manga.bilibili.com/detail/mc${comic_id}`;

    const spi_response = await got('https://api.bilibili.com/x/frontend/finger/spi');
    const buvid3 = spi_response.data.data.b_3;

    const query = 'device=pc&platform=web&nov=27&a=810';
    const body = JSON.stringify({
        comic_id: Number(comic_id),
    });

    const ultraSign = genReqSign(query, body, Date.now());

    const response = await got({
        method: 'POST',
        url: `https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?${query}&ultra_sign=${ultraSign}`,
        body,
        headers: {
            Referer: link,
            Cookie: `buvid3=${buvid3}; buvid4=${spi_response.data.data.b_4}`,
            'x-bili-data-sn': '1E74C20E5720FBF3BB351965D7A9DFC1',
        },
    });
    const data = decryptBytesData(response.data.bytesData, buvid3, comic_id);
    const author = data.author_name.join(', ');

    return {
        title: `${data.title} - 哔哩哔哩漫画`,
        link,
        image: data.vertical_cover,
        description: data.classic_lines,
        item: data.ep_list.slice(0, 20).map((item) => ({
            title: item.short_title === item.title ? item.short_title : `${item.short_title} ${item.title}`,
            author,
            description: `<img src="${item.cover}">`,
            pubDate: new Date(item.pub_time + ' +0800'),
            link: `https://manga.bilibili.com/mc${comic_id}/${item.id}`,
        })),
    };
}
