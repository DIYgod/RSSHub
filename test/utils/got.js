let got = require('../../lib/utils/got');
const config = require('../../lib/config');
const nock = require('nock');

afterEach(() => {
    delete process.env.PROXY_PROTOCOL;
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_AUTH;
    delete process.env.PROXY_URL_REGEX;
});

describe('got', () => {
    it('headers', async () => {
        nock('http://rsshub.test')
            .get('/test')
            .reply(function() {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                expect(this.req.headers['x-app']).toBe('RSSHub');
                return [200, ''];
            });

        await got.get('http://rsshub.test/test');
    });

    it('retry', async () => {
        const requestRun = jest.fn();
        let requestTime;
        nock('http://rsshub.test')
            .get('/testRerty')
            .times(config.requestRetry + 1)
            .reply(function() {
                requestRun();
                const now = new Date();
                if (requestTime) {
                    expect(now - requestTime).toBeGreaterThanOrEqual(100);
                    expect(now - requestTime).toBeLessThan(120);
                }
                requestTime = new Date();
                return [404, '0'];
            });

        try {
            await got.get('http://rsshub.test/testRerty');
        } catch (error) {
            expect(error.name).toBe('RequestError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry);
    });

    it('axios', async () => {
        nock('http://rsshub.test')
            .post('/post')
            .reply(function() {
                return [200, '{"code": 0}'];
            });

        const response1 = await got.post('http://rsshub.test/post', {
            form: true,
            data: {
                test: 1,
            },
        });
        expect(response1.statusCode).toBe(200);
        expect(response1.status).toBe(200);
        expect(response1.body).toBe('{"code": 0}');
        expect(response1.data.code).toBe(0);

        nock('http://rsshub.test')
            .get(/^\/params/)
            .reply(function() {
                expect(this.req.path).toBe('/params?test=1');
                return [200, ''];
            });

        await got.get('http://rsshub.test/params', {
            params: {
                test: 1,
            },
        });
    });

    it('proxy socks', async () => {
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';
        jest.resetModules();
        got = require('../../lib/utils/got');
        nock('http://rsshub.test')
            .get('/proxy')
            .reply(() => [200, '']);

        await got.get('http://rsshub.test/proxy', {
            hooks: {
                beforeRequest: [
                    (options) => {
                        expect(options.agent.constructor.name).toBe('SocksProxyAgent');
                        expect(options.agent.options.href).toBe('socks://rsshub.proxy:2333');
                    },
                ],
            },
        });
    });

    it('proxy http', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';
        jest.resetModules();
        got = require('../../lib/utils/got');
        nock('http://rsshub.test')
            .get('/proxy')
            .reply(() => [200, '']);

        await got.get('http://rsshub.test/proxy', {
            hooks: {
                beforeRequest: [
                    (options) => {
                        expect(options.agent.constructor.name).toBe('TunnelingAgent');
                        expect(options.agent.options.proxy.host).toBe('rsshub.proxy');
                        expect(options.agent.options.proxy.port).toBe(2333);
                    },
                ],
            },
        });
    });

    it('proxy https', async () => {
        process.env.PROXY_PROTOCOL = 'https';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';
        jest.resetModules();
        got = require('../../lib/utils/got');
        nock('http://rsshub.test')
            .get('/proxy')
            .reply(() => [200, '']);

        await got.get('http://rsshub.test/proxy', {
            hooks: {
                beforeRequest: [
                    (options) => {
                        expect(options.agent.constructor.name).toBe('TunnelingAgent');
                        expect(options.agent.options.proxy.host).toBe('rsshub.proxy');
                        expect(options.agent.options.proxy.port).toBe(2333);
                    },
                ],
            },
        });
    });

    it('auth', async () => {
        process.env.PROXY_AUTH = 'testtest';
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';
        jest.resetModules();
        got = require('../../lib/utils/got');
        nock('http://rsshub.test')
            .get('/auth')
            .reply(function() {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                expect(this.req.headers['proxy-authorization']).toBe('Basic testtest');
                return [200, ''];
            });

        await got.get('http://rsshub.test/auth');
    });

    it('url_regex', async () => {
        process.env.PROXY_URL_REGEX = 'url_regex';
        process.env.PROXY_PROTOCOL = 'socks';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';
        jest.resetModules();
        got = require('../../lib/utils/got');

        nock('http://rsshub.test')
            .get('/url_regex')
            .reply(() => [200, '']);
        nock('http://rsshub.test')
            .get('/proxy')
            .reply(() => [200, '']);

        await got.get('http://rsshub.test/url_regex', {
            hooks: {
                beforeRequest: [
                    (options) => {
                        expect(options.agent.constructor.name).toBe('SocksProxyAgent');
                        expect(options.agent.options.href).toBe('socks://rsshub.proxy:2333');
                    },
                ],
            },
        });

        await got.get('http://rsshub.test/proxy', {
            hooks: {
                beforeRequest: [
                    (options) => {
                        expect(options.agent).toBe(undefined);
                    },
                ],
            },
        });
    });
});
