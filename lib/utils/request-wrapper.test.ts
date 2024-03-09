import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import nock from 'nock';
import http from 'node:http';

let check: (
    request: Request & {
        agent: any;
        path: string;
    }
) => void = () => {};
const simpleResponse = '<rss version="2.0"><channel><item></item></channel></rss>';

beforeEach(() => {
    delete process.env.PAC_URI;
    delete process.env.PAC_SCRIPT;
});

afterEach(() => {
    delete process.env.PROXY_URI;
    delete process.env.PROXY_PROTOCOL;
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_AUTH;
    delete process.env.PROXY_URL_REGEX;

    nock.restore();
    nock.activate();
    check = () => {};

    const httpWrap = (func) => {
        const origin = func;
        return function (url, request) {
            if (typeof url === 'object') {
                if (url instanceof URL) {
                    check(request);
                } else {
                    check(url);
                }
            } else {
                check(request);
            }
            // @ts-expect-error any
            // eslint-disable-next-line prefer-rest-params
            return Reflect.apply(origin, this, arguments);
        };
    };
    http.get = httpWrap(http.get);
    http.request = httpWrap(http.request);

    vi.resetModules();
});

describe('got', () => {
    it('headers', async () => {
        await import('@/utils/request-wrapper');

        nock(/rsshub\.test/)
            .get(/.*/)
            .times(3)
            .reply(function () {
                expect(this.req.headers.referer).toBe('http://api.rsshub.test');
                expect(this.req.headers.host).toBe('api.rsshub.test');
                return [200, simpleResponse];
            });

        await got.get('http://api.rsshub.test/test');
        await got.get('http://api.rsshub.test');

        await parser.parseURL('http://api.rsshub.test/test');
    });

    it('proxy-uri socks', async () => {
        process.env.PROXY_URI = 'socks5://user:pass@rsshub.proxy:2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('SocksProxyAgent');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
            expect(request.agent.proxy.type).toBe(5);
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('proxy-uri http', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.protocol).toBe('http:');
            expect(request.agent.proxy.username).toBe('user');
            expect(request.agent.proxy.password).toBe('pass');
            expect(request.agent.proxy.host).toBe('rsshub.proxy:2333');
            expect(request.agent.proxy.hostname).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('proxy-uri https', async () => {
        process.env.PROXY_URI = 'https://rsshub.proxy:2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.protocol).toBe('https:');
            expect(request.agent.proxy.host).toBe('rsshub.proxy:2333');
            expect(request.agent.proxy.hostname).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('proxy socks', async () => {
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('SocksProxyAgent');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
            expect(request.agent.proxy.type).toBe(5);
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('proxy http', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.protocol).toBe('http:');
            expect(request.agent.proxy.host).toBe('rsshub.proxy:2333');
            expect(request.agent.proxy.hostname).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('proxy https', async () => {
        process.env.PROXY_PROTOCOL = 'https';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.protocol).toBe('https:');
            expect(request.agent.proxy.host).toBe('rsshub.proxy:2333');
            expect(request.agent.proxy.hostname).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('pac-uri http', async () => {
        process.env.PAC_URI = 'http://rsshub.proxy:2333';

        await import('@/utils/request-wrapper');

        check = (request) => {
            expect(request.agent.constructor.name).toBe('PacProxyAgent');
            expect(request.agent.uri.protocol).toBe('http:');
            expect(request.agent.uri.host).toBe('rsshub.proxy:2333');
            expect(request.agent.uri.hostname).toBe('rsshub.proxy');
            expect(request.agent.uri.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('pac-uri https', async () => {
        process.env.PAC_URI = 'https://rsshub.proxy:2333';

        await import('@/utils/request-wrapper');

        check = (request) => {
            expect(request.agent.constructor.name).toBe('PacProxyAgent');
            expect(request.agent.uri.protocol).toBe('https:');
            expect(request.agent.uri.host).toBe('rsshub.proxy:2333');
            expect(request.agent.uri.hostname).toBe('rsshub.proxy');
            expect(request.agent.uri.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('pac-uri ftp', async () => {
        process.env.PAC_URI = 'ftp://rsshub.proxy:2333';

        await import('@/utils/request-wrapper');

        check = (request) => {
            expect(request.agent.constructor.name).toBe('PacProxyAgent');
            expect(request.agent.uri.protocol).toBe('ftp:');
            expect(request.agent.uri.host).toBe('rsshub.proxy:2333');
            expect(request.agent.uri.hostname).toBe('rsshub.proxy');
            expect(request.agent.uri.port).toBe('2333');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('pac-uri file', async () => {
        process.env.PAC_URI = 'file:///D:/rsshub/proxy';

        await import('@/utils/request-wrapper');

        check = (request) => {
            expect(request.agent.constructor.name).toBe('PacProxyAgent');
            expect(request.agent.uri.protocol).toBe('file:');
            expect(request.agent.uri.pathname).toBe('/D:/rsshub/proxy');
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('pac-script data', async () => {
        process.env.PAC_SCRIPT = "function FindProxyForURL(url,host){return 'DIRECT';}";

        await import('@/utils/request-wrapper');

        check = (request) => {
            expect(request.agent.constructor.name).toBe('PacProxyAgent');
            expect(request.agent.uri.protocol).toBe('data:');
            expect(request.agent.uri.pathname).toBe("text/javascript;charset=utf-8,function%20FindProxyForURL(url%2Chost)%7Breturn%20'DIRECT'%3B%7D");
        };

        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(200, simpleResponse);

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });

    it('auth', async () => {
        process.env.PROXY_AUTH = 'testtest';
        process.env.PROXY_PROTOCOL = 'http'; // only http(s) proxies extract auth from Headers
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        await import('@/utils/request-wrapper');

        nock(/rsshub\.test/)
            .get('/auth')
            .times(2)
            .reply(function () {
                expect(this.req.headers['proxy-authorization']).toBe('Basic testtest');
                return [200, simpleResponse];
            });

        await got.get('http://rsshub.test/auth');
        await parser.parseURL('http://rsshub.test/auth');
    });

    it('url_regex', async () => {
        process.env.PROXY_URL_REGEX = 'url_regex';
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        await import('@/utils/request-wrapper');
        check = (request) => {
            if (request.path === '/url_regex') {
                expect(request.agent.constructor.name).toBe('SocksProxyAgent');
                expect(request.agent.proxy.host).toBe('rsshub.proxy');
                expect(request.agent.proxy.port).toBe(2333);
            } else if (request.path === '/proxy') {
                expect(request.agent).toBe(undefined);
            }
        };

        nock(/rsshub\.test/)
            .get('/url_regex')
            .times(2)
            .reply(() => [200, simpleResponse]);
        nock(/rsshub\.test/)
            .get('/proxy')
            .times(2)
            .reply(() => [200, simpleResponse]);

        await got.get('http://rsshub.test/url_regex');
        await parser.parseURL('http://rsshub.test/url_regex');

        await got.get('http://rsshub.test/proxy');
        await parser.parseURL('http://rsshub.test/proxy');
    });
});
