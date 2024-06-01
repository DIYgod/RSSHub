import { describe, expect, it, vi } from 'vitest';
import undici from 'undici';
import got from 'got';
import http from 'node:http';

process.env.PROXY_URI = 'http://rsshub.proxy:2333/';
process.env.PROXY_AUTH = 'rsshubtest';
process.env.PROXY_URL_REGEX = 'headers';

await import('@/utils/request-rewriter');
const { config } = await import('@/config');
const { default: ofetch } = await import('@/utils/ofetch');

describe('request-rewriter', () => {
    it('fetch', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch');

        try {
            await (await fetch('http://rsshub.test/headers')).json();
        } catch {
            // ignore
        }

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBe(config.ua);
        expect(headers.get('accept')).toBe('*/*');
        expect(headers.get('referer')).toBe('http://rsshub.test');

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
        const fetchSpy = vi.spyOn(undici, 'fetch');

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
        expect(headers.get('accept')).toBe('*/*');
        expect(headers.get('referer')).toBe('http://rsshub.test');

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
        expect(headers?.accept).toBe('*/*');
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
        const time = Date.now();
        await Promise.all(
            Array.from({ length: 20 }).map(async () => {
                try {
                    await fetch('http://rsshub.test/headers');
                } catch {
                    // ignore
                }
            })
        );
        expect(Date.now() - time).toBeGreaterThan(1500);
    });
});
