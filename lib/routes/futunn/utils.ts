import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';

/**
 * The page embeds a JWT whose `args` payload holds `Arr` (1-indexed digit positions counted from the right) and `Value`.
 * - pick a random integer < 1e12 (and >= 10^max(Arr)) whose digits at every position in `Arr` equal `Value`
 * - hash the JWT with a rolling h = (132 * h + charCode) mod 2^25 seeded at the FNV-1a basis 0x811c9dc5
 *
 * @param html - page containing the JWT
 * @returns `${jwt}@${number}@${hash}`
 */
const solveWafToken = (html: string) => {
    const jwt = /"(eyJ[\w-]+\.[\w-]+\.[\w-]+)"/.exec(html)![1];
    const payload = new TextDecoder().decode(Uint8Array.fromBase64(jwt.split('.', 2)[1], { alphabet: 'base64url' }));
    const { Arr: arr, Value: value }: { Arr: number[]; Value: number } = JSON.parse(JSON.parse(payload).args);

    let number: number;
    do {
        number = Math.floor(Math.random() * 1_000_000_000_000);
    } while (number < 10 ** Math.max(...arr) || arr.some((position) => Math.floor((number / 10 ** (position - 1)) % 10) !== value));

    let hash = 0x81_1c_9d_c5;
    for (const char of jwt) {
        hash = (0x84 * hash + char.codePointAt(0)!) % 2 ** 25;
    }

    return `${jwt}@${number}@${hash.toString(16)}`;
};

export const getArticle = async (link: string) => {
    let html = await ofetch(link);
    if (html.includes('wafToken=')) {
        html = await ofetch(link, {
            headers: {
                cookie: `wafToken=${solveWafToken(html)}`,
            },
        });
    }
    return load(html);
};
