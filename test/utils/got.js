let got = require('../../lib/utils/got');
const config = require('../../lib/config');
const nock = require('nock');
describe('got', () => {
    it('headers', async () => {
        nock('http://rsshub.test')
            .get('/test')
            .reply(function() {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                expect(this.req.headers['x-app']).toBe('RSSHub');
                return [
                    200,
                    {
                        code: 0,
                    },
                ];
            });

        const response = await got.get('http://rsshub.test/test');
        expect(response.status).toBe(200);
        expect(response.data.code).toBe(0);
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
                return [
                    404,
                    {
                        code: 1,
                    },
                ];
            });

        try {
            await got.get('http://rsshub.test/testRerty');
        } catch (error) {
            expect(error.name).toBe('RequestError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry);
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
});
