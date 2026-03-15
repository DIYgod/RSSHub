import http from 'node:http';
import https from 'node:https';

import got from 'got';
import undici from 'undici';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { PRESETS } from '@/utils/header-generator';

const originalGlobals = {
    fetch: globalThis.fetch,
    Headers: globalThis.Headers,
    FormData: globalThis.FormData,
    Request: globalThis.Request,
    Response: globalThis.Response,
};
const originalHttp = {
    get: http.get,
    request: http.request,
};
const originalHttps = {
    get: https.get,
    request: https.request,
};
const originalEnv = {
    PROXY_URI: process.env.PROXY_URI,
    PROXY_AUTH: process.env.PROXY_AUTH,
    PROXY_URL_REGEX: process.env.PROXY_URL_REGEX,
};

process.env.PROXY_URI = 'http://rsshub.proxy:2333/';
process.env.PROXY_AUTH = 'rsshubtest';
process.env.PROXY_URL_REGEX = 'headers';

await import('@/utils/request-rewriter');
const { config } = await import('@/config');
const { default: ofetch } = await import('@/utils/ofetch');

const createJsonResponse = () =>
    Response.json(
        { ok: true },
        {
            headers: {
                'content-type': 'application/json',
            },
        }
    );

describe('request-rewriter', () => {
    afterAll(() => {
        globalThis.fetch = originalGlobals.fetch;
        globalThis.Headers = originalGlobals.Headers;
        globalThis.FormData = originalGlobals.FormData;
        globalThis.Request = originalGlobals.Request;
        globalThis.Response = originalGlobals.Response;

        http.get = originalHttp.get;
        http.request = originalHttp.request;
        https.get = originalHttps.get;
        https.request = originalHttps.request;

        if (originalEnv.PROXY_URI === undefined) {
            delete process.env.PROXY_URI;
        } else {
            process.env.PROXY_URI = originalEnv.PROXY_URI;
        }
        if (originalEnv.PROXY_AUTH === undefined) {
            delete process.env.PROXY_AUTH;
        } else {
            process.env.PROXY_AUTH = originalEnv.PROXY_AUTH;
        }
        if (originalEnv.PROXY_URL_REGEX === undefined) {
            delete process.env.PROXY_URL_REGEX;
        } else {
            process.env.PROXY_URL_REGEX = originalEnv.PROXY_URL_REGEX;
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetch', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(createJsonResponse()));

        try {
            await (await fetch('http://rsshub.test/headers')).json();
        } catch {
            // ignore
        }

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBe(config.ua);
        expect(headers.get('accept')).toBeDefined();
        expect(headers.get('referer')).toBe('http://rsshub.test');
        expect(headers.get('sec-ch-ua')).toBeDefined();
        expect(headers.get('sec-ch-ua-mobile')).toBeDefined();
        expect(headers.get('sec-ch-ua-platform')).toBeDefined();
        expect(headers.get('sec-fetch-site')).toBeDefined();
        expect(headers.get('sec-fetch-mode')).toBeDefined();
        expect(headers.get('sec-fetch-user')).toBeDefined();
        expect(headers.get('sec-fetch-dest')).toBeDefined();

        // proxy
        const options = fetchSpy.mock.lastCall?.[1];
        const agentKey = Object.getOwnPropertySymbols(options?.dispatcher).find((s) => s.description === 'proxy agent options');
        const agentUri = agentKey ? options?.dispatcher?.[agentKey].uri : null;
        expect(agentUri).toBe(process.env.PROXY_URI);

        // proxy auth
        const headersKey = Object.getOwnPropertySymbols(options?.dispatcher).find((s) => s.description === 'proxy headers');
        const agentHeaders = headersKey ? options?.dispatcher?.[headersKey] : null;
        expect(agentHeaders['proxy-authorization']).toBe(`Basic ${process.env.PROXY_AUTH}`);

        // url regex not match
        {
            try {
                await (await fetch('http://rsshub.test/rss')).json();
            } catch {
                // ignore
            }
            const options = fetchSpy.mock.lastCall?.[1];
            expect(options?.dispatcher).toBeUndefined();
        }
    });

    it('ofetch', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(createJsonResponse()));

        try {
            await ofetch('http://rsshub.test/headers', {
                retry: 0,
            });
        } catch {
            // ignore
        }

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBe(config.ua);
        expect(headers.get('accept')).toBeDefined();
        expect(headers.get('referer')).toBe('http://rsshub.test');
        expect(headers.get('sec-ch-ua')).toBeDefined();
        expect(headers.get('sec-ch-ua-mobile')).toBeDefined();
        expect(headers.get('sec-ch-ua-platform')).toBeDefined();
        expect(headers.get('sec-fetch-site')).toBeDefined();
        expect(headers.get('sec-fetch-mode')).toBeDefined();
        expect(headers.get('sec-fetch-user')).toBeDefined();
        expect(headers.get('sec-fetch-dest')).toBeDefined();

        // proxy
        const options = fetchSpy.mock.lastCall?.[1];
        const agentKey = Object.getOwnPropertySymbols(options?.dispatcher).find((s) => s.description === 'proxy agent options');
        const agentUri = agentKey ? options?.dispatcher?.[agentKey].uri : null;
        expect(agentUri).toBe(process.env.PROXY_URI);

        // proxy auth
        const headersKey = Object.getOwnPropertySymbols(options?.dispatcher).find((s) => s.description === 'proxy headers');
        const agentHeaders = headersKey ? options?.dispatcher?.[headersKey] : null;
        expect(agentHeaders['proxy-authorization']).toBe(`Basic ${process.env.PROXY_AUTH}`);

        // url regex not match
        {
            try {
                await ofetch('http://rsshub.test/rss', {
                    retry: 0,
                });
            } catch {
                // ignore
            }
            const options = fetchSpy.mock.lastCall?.[1];
            expect(options?.dispatcher).toBeUndefined();
        }
    });

    it('ofetch custom ua', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(createJsonResponse()));
        const userAgent = config.trueUA;

        try {
            await ofetch('http://rsshub.test/headers', {
                retry: 0,
                headers: {
                    'user-agent': userAgent,
                },
            });
        } catch {
            // ignore
        }

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBe(userAgent);
    });

    it('ofetch header preset', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(createJsonResponse()));

        try {
            await ofetch('http://rsshub.test/headers', {
                retry: 0,
                headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME,
            });
        } catch {
            // ignore
        }

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBeDefined();
        expect(headers.get('accept')).toBeDefined();
        expect(headers.get('referer')).toBe('http://rsshub.test');
        expect(headers.get('sec-ch-ua')).toBeDefined();
        expect(headers.get('sec-ch-ua-mobile')).toBe('?0');
        expect(headers.get('sec-ch-ua-platform')).toBe('"Windows"');
        expect(headers.get('sec-fetch-site')).toBeDefined();
        expect(headers.get('sec-fetch-mode')).toBeDefined();
        expect(headers.get('sec-fetch-user')).toBeDefined();
        expect(headers.get('sec-fetch-dest')).toBeDefined();
    });

    it('http', async () => {
        const httpSpy = vi.spyOn(http, 'request');

        try {
            await got.get('http://rsshub.test/headers', {
                headers: {
                    'user-agent': undefined,
                    accept: undefined,
                },
            });
        } catch {
            // ignore
        }

        // headers
        const options = httpSpy.mock.lastCall?.[1];
        const headers = options?.headers;
        expect(headers?.['user-agent']).toBe(config.ua);
        expect(headers?.accept).toBeDefined();
        expect(headers?.referer).toBe('http://rsshub.test');

        // proxy
        const agentUri = options?.agent?.proxy?.href;
        expect(agentUri).toBe(process.env.PROXY_URI);
        expect(options?.agent?.proxyHeaders['proxy-authorization']).toBe(`Basic ${process.env.PROXY_AUTH}`);

        // url regex not match
        {
            try {
                await got.get('http://rsshub.test/rss', {
                    headers: {
                        'user-agent': undefined,
                        accept: undefined,
                    },
                });
            } catch {
                // ignore
            }
            const options = httpSpy.mock.lastCall?.[1];
            expect(options?.agent).toBeUndefined();
        }
    });

    it('rate limiter', async () => {
        vi.useFakeTimers();
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(createJsonResponse()));

        try {
            const { default: wrappedFetch } = await import('@/utils/request-rewriter/fetch');
            const time = Date.now();
            const tasks = Array.from({ length: 20 }).map(() => wrappedFetch('http://rsshub.test/headers'));

            await vi.advanceTimersByTimeAsync(3000);
            await Promise.all(tasks);

            expect(fetchSpy).toHaveBeenCalledTimes(20);
            expect(Date.now() - time).toBeGreaterThan(1500);
        } finally {
            vi.useRealTimers();
            fetchSpy.mockRestore();
        }
    }, 20000);
});
