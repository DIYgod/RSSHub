import { JSDOM, VirtualConsole } from 'jsdom';
import { VM } from 'vm2';

import { config } from '@/config';
import cache from '@/utils/cache';
import { generateHeaders } from '@/utils/header-generator';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

import { getSignedHeaders } from './sign';
import type { ZhihuClient } from './utils';

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
                .slice('d_c0='.length)
                .split('|', 1)[0]
                .replace(/=+$/, '') || '';
    }
    if (!dc0) {
        throw new Error('zhihu: failed to obtain a guest d_c0 cookie');
    }

    const challenge = await ofetch.raw<string>(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...headers,
            cookie: `d_c0=${dc0}; __zse_ck=005_x-x`,
            referer: url,
            'x-requested-with': 'fetch',
        },
        ignoreResponseError: true,
    });
    const html = challenge._data ?? '';
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
    const setCookie = cookieDescriptor?.set;
    if (!cookieDescriptor?.get || !setCookie) {
        window.close();
        throw new Error('zhihu: JSDOM did not provide document.cookie accessors');
    }
    const tokenPromise = new Promise<string>((resolve) => {
        Object.defineProperty(window.document, 'cookie', {
            configurable: true,
            get: cookieDescriptor.get,
            set(value: string) {
                setCookie.call(window.document, value);
                const token = value.match(/__zse_ck=([^;]+)/)?.[1];
                if (token?.includes('-')) {
                    resolve(token);
                }
            },
        });
    });

    let zseCk: string | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | number | undefined;
    try {
        // Zhihu's challenge is intentionally delivered as executable JavaScript.
        new VM({ timeout: 3000, sandbox: window }).run(vmScript);
        const timeout = new Promise<undefined>((resolve) => {
            timeoutId = setTimeout(resolve, 3000);
        });
        zseCk = await Promise.race([tokenPromise, timeout]);
    } finally {
        clearTimeout(timeoutId);
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

export const createJSDOMClient = (pageUrl: string, configured: string, configuredDc0: string): ZhihuClient => {
    let sessionPromise: Promise<{ dc0: string; headers: { cookie: string; 'user-agent': string } }> | undefined;
    const startSession = async (apiPath: string) => {
        try {
            const { dc0, zseCk, ua } = await getGeneratedZseCredentials(pageUrl, apiPath, configuredDc0);
            return {
                dc0,
                headers: {
                    // An isolated login cookie must not be mixed with a new guest identity.
                    cookie: configuredDc0 ? mergeGeneratedCookies(configured, dc0, zseCk) : `__zse_ck=${zseCk}; d_c0=${dc0}`,
                    'user-agent': ua,
                },
            };
        } catch (error) {
            sessionPromise = undefined;
            throw error;
        }
    };
    const getSession = (apiPath = new URL(pageUrl).pathname + new URL(pageUrl).search) => (sessionPromise ??= startSession(apiPath));

    return {
        get: async <Result = any>(apiPath: string): Promise<Result> => {
            if (!apiPath.startsWith('/api/')) {
                throw new Error('zhihu: expected an API path');
            }
            const { dc0, headers } = await getSession(apiPath);
            return ofetch<Result>(`https://www.zhihu.com${apiPath}`, {
                headers: { ...getSignedHeaders(apiPath, dc0), ...headers, Referer: pageUrl },
            });
        },
        getPage: async () => {
            const { headers } = await getSession();
            return ofetch<string>(pageUrl, { headers: { ...headers, Referer: pageUrl }, parseResponse: (text) => text });
        },
    };
};
