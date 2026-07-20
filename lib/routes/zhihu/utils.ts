import { Script } from 'node:vm';

import { load } from 'cheerio';
import { JSDOM, VirtualConsole } from 'jsdom';

import { config } from '@/config';
import cache from '@/utils/cache';
import { generateHeaders } from '@/utils/header-generator';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import wait from '@/utils/wait';

import { encrypt as g_encrypt } from './execlib/x-zse-96-v3';

export const header = {
    'x-api-version': '3.0.91',
};

const fixImageUrl = (url: string) => url.split('?', 1)[0].replace('_b.jpg', '.jpg').replace('_r.jpg', '.jpg').replace('_720w.jpg', '.jpg');

export const processImage = (content: string) => {
    const $ = load(content, null, false);

    $('noscript, a[data-draft-type="mcn-link-card"]').remove();

    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href?.startsWith('http://link.zhihu.com/?target=') || href?.startsWith('https://link.zhihu.com/?target=')) {
            const url = new URL(href);
            const target = url.searchParams.get('target') || '';
            try {
                $(elem).attr('href', decodeURIComponent(target));
            } catch {
                // sometimes the target is not a valid url
            }
        }
    });

    $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img').each((i, e) => {
        if (e.attribs['data-actualsrc']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-actualsrc']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-actualsrc');
        } else if (e.attribs['data-original']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-original']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-original');
        } else {
            $(e).attr({
                src: fixImageUrl(e.attribs.src),
                width: null,
                height: null,
            });
        }
    });

    return $.html();
};

const getCookieValueFrom = (cookieStr: string | undefined, key: string) =>
    cookieStr
        ?.split(';')
        .map((e) => e.trim())
        .find((e) => e.startsWith(key + '='))
        ?.slice(key.length + 1) || '';

export const getCookieValueByKey = (key: string) => getCookieValueFrom(config.zhihu.cookies as string | undefined, key);

let isUnreachableRuntimeErrorGuarded = false;
const pendingZseCredentials = new Map<string, Promise<{ dc0: string; zseCk: string; ua: string }>>();

const preventUnreachableRuntimeError = () => {
    if (isUnreachableRuntimeErrorGuarded) {
        return;
    }
    isUnreachableRuntimeErrorGuarded = true;
    process.on('unhandledRejection', (reason) => {
        const error = reason as { name?: string; message?: string } | undefined;
        if (error?.name === 'RuntimeError' && error.message === 'unreachable') {
            return;
        }
        throw reason;
    });
};

const generateZseCk = async (url: string, apiPath: string, configuredDc0: string) => {
    preventUnreachableRuntimeError();

    // `__zse_ck` is checked against the user-agent that generated it.
    const ua = generateHeaders()['user-agent'];
    const headers = { 'user-agent': ua };

    let dc0 = configuredDc0;
    if (!dc0) {
        const seed = await ofetch.raw('https://www.zhihu.com/explore', {
            headers,
            redirect: 'manual',
            ignoreResponseError: true,
        });
        dc0 =
            (seed.headers.getSetCookie?.() ?? [])
                .find((line) => line.startsWith('d_c0='))
                ?.split(';', 1)[0]
                .slice('d_c0='.length) || '';
    }
    if (!dc0) {
        throw new Error('zhihu: failed to obtain a guest d_c0 cookie');
    }

    const challenge = await ofetch.raw(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...headers,
            cookie: `d_c0=${dc0}; __zse_ck=005_x-x`,
            referer: url,
            'x-requested-with': 'fetch',
        },
        ignoreResponseError: true,
    });
    const html = challenge._data as string;
    const meta = html.match(/id="zh-zse-ck"[^>]*content="([^"]*)"/)?.[1];
    const hash = html.match(/zse-ck\/v4\/([a-f0-9]+)\.js/)?.[1];
    if (!meta || !hash) {
        throw new Error('zhihu: challenge page did not contain an URL to __zse_ck meta/script');
    }

    const vmScript = await ofetch<string>(`https://static.zhihu.com/zse-ck/v4/${hash}.js`, {
        headers,
        parseResponse: (text) => text,
    });
    const dom = new JSDOM(`<!doctype html><html><head><meta id="zh-zse-ck" content="${meta}"><script data-assets-tracker-config='{"appName":"zse_ck"}'></script></head><body></body></html>`, {
        url,
        referrer: 'https://www.zhihu.com/',
        runScripts: 'outside-only',
        pretendToBeVisual: true,
        virtualConsole: new VirtualConsole(),
    });
    const { window } = dom;
    Object.defineProperties(window.navigator, {
        userAgent: { value: ua, configurable: true },
        webdriver: { value: false, configurable: true },
    });
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder as typeof window.TextDecoder;
    window.atob = (value: string) => Buffer.from(value, 'base64').toString('binary');
    window.btoa = (value: string) => Buffer.from(value, 'binary').toString('base64');
    Object.assign(window, { __g: {} });

    const cookieDescriptor = Object.getOwnPropertyDescriptor(window.Document.prototype, 'cookie');
    if (!cookieDescriptor?.get || !cookieDescriptor.set) {
        window.close();
        throw new Error('zhihu: JSDOM did not provide document.cookie accessors');
    }
    const tokenPromise = new Promise<string>((resolve) => {
        Object.defineProperty(window.document, 'cookie', {
            configurable: true,
            get: cookieDescriptor.get,
            set(value: string) {
                Reflect.apply(cookieDescriptor.set, window.document, [value]);
                const token = value.match(/__zse_ck=([^;]+)/)?.[1];
                if (token?.includes('-')) {
                    resolve(token);
                }
            },
        });
    });

    let zseCk: string | undefined;
    try {
        // Zhihu's challenge is intentionally delivered as executable JavaScript.
        new Script(vmScript).runInContext(dom.getInternalVMContext());
        zseCk = (await Promise.race([tokenPromise, wait(3000)])) as string | undefined;
    } finally {
        window.close();
    }
    if (!zseCk) {
        throw new Error('zhihu: WASM VM did not produce a __zse_ck');
    }
    return { dc0, zseCk, ua };
};

const getGeneratedZseCredentials = (url: string, apiPath: string, configuredDc0: string) => {
    const cacheKey = `zhihu:zse-ck:v4:${configuredDc0 ? md5(configuredDc0) : 'guest'}`;
    const pending = pendingZseCredentials.get(cacheKey);
    if (pending) {
        return pending;
    }

    const created = (async () => {
        try {
            return await cache.tryGet(cacheKey, () => generateZseCk(url, apiPath, configuredDc0), config.cache.contentExpire, false);
        } finally {
            pendingZseCredentials.delete(cacheKey);
        }
    })();
    pendingZseCredentials.set(cacheKey, created);
    return created;
};

const mergeGeneratedCookies = (configured: string, dc0: string, zseCk: string) => {
    const remaining = configured
        .split(';')
        .map((pair) => pair.trim())
        .filter((pair) => {
            const name = pair.split('=', 1)[0];
            return name && name !== 'd_c0' && name !== '__zse_ck';
        });
    return [`__zse_ck=${zseCk}`, `d_c0=${dc0}`, ...remaining].join('; ');
};

export const getSignedHeader = async (url: string, apiPath: string) => {
    const configured = (config?.zhihu?.cookies as string | undefined) || '';

    const configuredDc0 = getCookieValueFrom(configured, 'd_c0');
    const configuredZseCk = getCookieValueFrom(configured, '__zse_ck');

    // A configured pair may have been generated with a different user-agent, so
    // preserve the previous behavior and trust it as-is. Generated credentials
    // always return their matching user-agent.
    let cookieStr: string;
    let ua: string | undefined;
    if (configuredDc0 && configuredZseCk) {
        cookieStr = configured;
    } else {
        const credentials = await getGeneratedZseCredentials(url, apiPath, configuredDc0);
        // Login cookies only belong to the configured d_c0 session. Do not mix
        // an isolated z_c0 with a newly-created guest session.
        cookieStr = configuredDc0 ? mergeGeneratedCookies(configured, credentials.dc0, credentials.zseCk) : `__zse_ck=${credentials.zseCk}; d_c0=${credentials.dc0}`;
        ua = credentials.ua;
    }

    // Sign with the same `d_c0` that is sent, otherwise the backend rejects the
    // request. Refer to https://github.com/srx-2000/spider_collection/issues/18
    const dc0 = getCookieValueFrom(cookieStr, 'd_c0');
    const xzse93 = '101_3_3.0';
    const f = `${xzse93}+${apiPath}+${dc0}`;
    const xzse96 = '2.0_' + g_encrypt(md5(f));

    return {
        cookie: cookieStr,
        ...(ua && { 'user-agent': ua }),
        'x-zse-96': xzse96,
        'x-app-za': 'OS=Web',
        'x-zse-93': xzse93,
    };
};
