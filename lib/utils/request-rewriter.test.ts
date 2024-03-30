import { describe, expect, it, afterEach, vi } from 'vitest';
import '@/utils/request-rewriter';
import { config } from '@/config';

import ofetch from '@/utils/ofetch';
import got from 'got';

afterEach(() => {
    delete process.env.PROXY_URI;
    delete process.env.PROXY_AUTH;
    delete process.env.PROXY_URL_REGEX;

    vi.resetModules();
});

describe('request-rewriter', () => {
    it('ofetch', async () => {
        const response = await ofetch('http://rsshub.test/headers');
        expect(response['user-agent']).toBe(config.ua);
        expect(response.accept).toBe('*/*');
        expect(response.referer).toBe('http://rsshub.test');
    });

    it('fetch', async () => {
        const response = await (await fetch('http://rsshub.test/headers')).json();
        expect(response['user-agent']).toBe(config.ua);
        expect(response.accept).toBe('*/*');
        expect(response.referer).toBe('http://rsshub.test');
    });

    it('http', async () => {
        const { config } = await import('@/config');
        await import('@/utils/request-rewriter');

        const response = await got
            .get('http://rsshub.test/headers', {
                headers: {
                    'user-agent': undefined,
                    accept: undefined,
                },
            })
            .json<any>();
        expect(response['user-agent']).toBe(config.ua);
        expect(response.accept).toBe('*/*');
        expect(response.referer).toBe('http://rsshub.test');
    });

    // it('proxy-uri http', async () => {
    //     process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

    //     await import('@/utils/request-wrapper');
    //     check = (request) => {
    //         expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
    //         expect(request.agent.proxy.protocol).toBe('http:');
    //         expect(request.agent.proxy.username).toBe('user');
    //         expect(request.agent.proxy.password).toBe('pass');
    //         expect(request.agent.proxy.host).toBe('rsshub.proxy:2333');
    //         expect(request.agent.proxy.hostname).toBe('rsshub.proxy');
    //         expect(request.agent.proxy.port).toBe('2333');
    //     };

    //     nock(/rsshub\.test/)
    //         .get('/proxy')
    //         .times(2)
    //         .reply(200, simpleResponse);

    //     await got.get('http://rsshub.test/proxy');
    //     await parser.parseURL('http://rsshub.test/proxy');
    // });

    // it('auth', async () => {
    //     process.env.PROXY_AUTH = 'testtest';
    //     process.env.PROXY_PROTOCOL = 'http'; // only http(s) proxies extract auth from Headers
    //     process.env.PROXY_HOST = 'rsshub.proxy';
    //     process.env.PROXY_PORT = '2333';

    //     await import('@/utils/request-wrapper');

    //     nock(/rsshub\.test/)
    //         .get('/auth')
    //         .times(2)
    //         .reply(function () {
    //             expect(this.req.headers['proxy-authorization']).toBe('Basic testtest');
    //             return [200, simpleResponse];
    //         });

    //     await got.get('http://rsshub.test/auth');
    //     await parser.parseURL('http://rsshub.test/auth');
    // });

    // it('url_regex', async () => {
    //     process.env.PROXY_URL_REGEX = 'url_regex';
    //     process.env.PROXY_PROTOCOL = 'socks';
    //     process.env.PROXY_HOST = 'rsshub.proxy';
    //     process.env.PROXY_PORT = '2333';

    //     await import('@/utils/request-wrapper');
    //     check = (request) => {
    //         if (request.path === '/url_regex') {
    //             expect(request.agent.constructor.name).toBe('SocksProxyAgent');
    //             expect(request.agent.proxy.host).toBe('rsshub.proxy');
    //             expect(request.agent.proxy.port).toBe(2333);
    //         } else if (request.path === '/proxy') {
    //             expect(request.agent).toBe(undefined);
    //         }
    //     };

    //     nock(/rsshub\.test/)
    //         .get('/url_regex')
    //         .times(2)
    //         .reply(() => [200, simpleResponse]);
    //     nock(/rsshub\.test/)
    //         .get('/proxy')
    //         .times(2)
    //         .reply(() => [200, simpleResponse]);

    //     await got.get('http://rsshub.test/url_regex');
    //     await parser.parseURL('http://rsshub.test/url_regex');

    //     await got.get('http://rsshub.test/proxy');
    //     await parser.parseURL('http://rsshub.test/proxy');
    // });
});
