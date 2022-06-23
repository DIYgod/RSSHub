const got = require('../../lib/utils/got');
const parser = require('../../lib/utils/rss-parser');
const nock = require('nock');
require('../../lib/utils/request-wrapper');
let check = () => {};
const simpleResponse = '<rss version="2.0"><channel><item></item></channel></rss>';

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

    const http = require('http');
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
            return origin.apply(this, arguments);
        };
    };
    http.get = httpWrap(http.get);
    http.request = httpWrap(http.request);
});

describe('got', () => {
    it('headers', async () => {
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('SocksProxyAgent');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.auth).toBe('user:pass');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('HttpsProxyAgent');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('SocksProxyAgent');
            expect(request.agent.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.proxy.port).toBe(2333);
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('TunnelingAgent');
            expect(request.agent.options.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.options.proxy.port).toBe(2333);
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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
        check = (request) => {
            expect(request.agent.constructor.name).toBe('TunnelingAgent');
            expect(request.agent.options.proxy.host).toBe('rsshub.proxy');
            expect(request.agent.options.proxy.port).toBe(2333);
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
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        jest.resetModules();
        require('../../lib/utils/request-wrapper');

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

        jest.resetModules();
        require('../../lib/utils/request-wrapper');
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
