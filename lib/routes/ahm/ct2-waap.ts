import { createCipheriv, createDecipheriv, randomUUID } from 'node:crypto';

import { evaluateScriptData } from '@/utils/evaluate-script';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

interface Challenge {
    salt: string;
    envKey: string;
    queryKey: string;
    envCookie: string;
    queryCookie: string;
    bundleMd5: string;
}

const challengeCache = new Map<string, Challenge>();

const hex = (s: string) => (s.startsWith('-') ? -Number(s.slice(1)) : Number(s));
const argRe = /^(\w+)(?:-\s?(-?0x[0-9a-f]+))?$/;

const decodeStrings = async (bundle: string) => {
    const dec = bundle.match(/function (\w+)\((\w+),\w+\)\{\2=\2-(0x[0-9a-fA-F]+);var \w+=(\w+)\(\);/);
    if (!dec) {
        throw new Error('CT2-WAAP: string decoder missing');
    }

    const [, decoderName, , baseHex, tableFn] = dec;
    const tableStart = bundle.indexOf(`function ${tableFn}(){var `);
    const tableEnd = bundle.indexOf(`];${tableFn}=function`, tableStart);
    if (tableStart === -1 || tableEnd === -1) {
        throw new Error('CT2-WAAP: string table missing');
    }

    const table = await evaluateScriptData<string[]>(`${bundle.slice(tableStart + `function ${tableFn}(){`.length, tableEnd + 1)};`, bundle.slice(tableStart, tableEnd).match(/var (\w+)=\[/)![1]);
    const base = Number(baseHex);

    const wrappers = new Map<string, { params: string[]; callee: string; args: Array<{ p: string; off: number }> }>();
    for (const m of bundle.matchAll(/function (\w+)\(([\w,]*)\)\{return (\w+)\(([^()]*)\);\}/g)) {
        const args = m[4].split(',').map((a) => a.match(argRe));
        if (args.every((a) => a !== null)) {
            wrappers.set(m[1], { params: m[2].split(','), callee: m[3], args: args.map((a) => ({ p: a[1], off: a[2] ? hex(a[2]) : 0 })) });
        }
    }

    const decode = (name: string, vals: number[], depth = 0): string | undefined => {
        if (name === decoderName) {
            return table[vals[0] - base];
        }
        const w = wrappers.get(name);
        if (!w || depth > 16) {
            return undefined;
        }

        const env = Object.fromEntries(w.params.map((p, i) => [p, vals[i]]));
        return decode(
            w.callee,
            w.args.map((a) => env[a.p] - a.off),
            depth + 1
        );
    };

    return bundle.replaceAll(/\b(\w+)\((-?0x[0-9a-f]+(?:,-?0x[0-9a-f]+)*)\)/g, (call, name: string, args: string) => {
        const value =
            name === decoderName || wrappers.has(name)
                ? decode(
                      name,
                      args.split(',').map((a) => hex(a))
                  )
                : undefined;
        return value === undefined ? call : JSON.stringify(value);
    });
};

const q = String.raw`["']`;

const analyzeBundle = async (bundle: string): Promise<Challenge> => {
    const plain = await decodeStrings(bundle);
    const salt = plain.match(new RegExp(String.raw`\[${q}slice${q}\]\(0x0,0x4\)\+${q}([^"']+)${q}`));
    const keys = plain.match(new RegExp(String.raw`${q}env${q}===\w+\?\w+\[${q}xyjgnaksfLocal${q}\]\[${q}(\w+)${q}\]:\w+\[${q}xyjgnaksfLocal${q}\]\[${q}(\w+)${q}\]`));

    const cookieVar = (role: string) => {
        const call = plain.match(new RegExp(String.raw`\(${q}${role}${q},(\w+),\w+\)`));
        const lit = call && plain.match(new RegExp(String.raw`[,;\s]${call[1]}=${q}(CT_\w+)${q}`));
        return lit?.[1];
    };
    const envCookie = cookieVar('env');
    const queryCookie = cookieVar('query');
    if (!salt || !keys || !envCookie || !queryCookie) {
        throw new Error('CT2-WAAP: bundle structure changed');
    }

    return {
        salt: salt[1],
        envKey: keys[1],
        queryKey: keys[2],
        envCookie,
        queryCookie,
        bundleMd5: md5(bundle),
    };
};

const aes = (key: string) => ({
    decrypt: (b64: string) => {
        const d = createDecipheriv('aes-128-cbc', key, key);
        return Buffer.concat([d.update(b64, 'base64'), d.final()]).toString('utf8');
    },
    encrypt: (text: string) => {
        const c = createCipheriv('aes-128-cbc', key, key);
        return Buffer.concat([c.update(text, 'utf8'), c.final()]).toString('base64');
    },
});

const alnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomString = (n: number) => Array.from({ length: n }, () => alnum[Math.floor(Math.random() * alnum.length)]).join('');

const visitorId = () => {
    const uuid = randomUUID();
    let sum = 0;
    for (const ch of uuid.replaceAll('-', '')) {
        sum += Number.parseInt(ch, 16) % 10;
    }
    const head = String(sum).slice(0, 3).padStart(3, '0');
    const parts = uuid.split('-');
    parts.splice(1, 0, head + randomString(8 - head.length));
    return parts.join('-');
};

const buildCookies = (c: Challenge, encStr: string) => {
    const cfg = JSON.parse(aes(encStr.slice(0, 4) + c.salt).decrypt(encStr.slice(4))) as Record<string, unknown>;
    const serverTime = Object.values(cfg).find((v) => typeof v === 'string' && /^\d{10}$/.test(v)) as string | undefined;
    const envKey = cfg[c.envKey];
    const queryKey = cfg[c.queryKey];
    if (!serverTime || typeof envKey !== 'string' || typeof queryKey !== 'string') {
        throw new Error('CT2-WAAP: challenge config changed');
    }
    const last2 = serverTime.slice(-2);
    const wrap = (data: string) => `002&&${serverTime}&&${data}&&${last2}`;
    return {
        [c.envCookie]: aes(envKey.slice(3, 19)).encrypt(wrap(`envCTCT&&${visitorId()}&&0&&allRight`)),
        [c.queryCookie]: aes(queryKey.slice(3, 19)).encrypt(wrap(`queryCTCT&&${randomString(2)}&&${c.bundleMd5}`)),
    };
};

export const fetchPage = async (pageUrl: string): Promise<string> => {
    const first = await ofetch.raw(pageUrl, {
        responseType: 'text',
        ignoreResponseError: true,
    });
    const html = first._data ?? '';
    if (first.status === 200 && !html.includes('ctct_bundle')) {
        return html;
    }

    const scripts = Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/g), (m) => m[1]);
    const xyPath = scripts.find((s) => !s.includes('ctct_bundle'));
    const bundlePath = scripts.find((s) => s.includes('ctct_bundle'));
    if (!xyPath || !bundlePath) {
        throw new Error(`CT2-WAAP: unexpected status ${first.status} for ${pageUrl}`);
    }

    const bundleUrl = new URL(bundlePath, pageUrl).href;
    const [xy, bundleText] = await Promise.all([ofetch(new URL(xyPath, pageUrl).href, { responseType: 'text' }), ofetch(bundleUrl, { responseType: 'text' })]);

    const candidates = xy.matchAll(/var (\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g).toArray();
    candidates.sort((a, b) => b[2].length - a[2].length);
    if (!candidates.length) {
        throw new Error('CT2-WAAP: challenge config missing');
    }

    let challenge = challengeCache.get(bundleUrl);
    if (!challenge) {
        if (challengeCache.size > 5) {
            challengeCache.clear();
        }
        challenge = await analyzeBundle(bundleText);
        challengeCache.set(bundleUrl, challenge);
    }

    const cookie = Object.entries(buildCookies(challenge, candidates[0][2]))
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');

    const second = await ofetch.raw(pageUrl, {
        headers: { Cookie: cookie },
        responseType: 'text',
        ignoreResponseError: true,
    });
    if (second.status !== 200) {
        challengeCache.delete(bundleUrl);
        throw new Error(`CT2-WAAP: challenge failed with ${second.status} for ${pageUrl}`);
    }

    return second._data ?? '';
};
