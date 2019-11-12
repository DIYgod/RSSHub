const got = require('../../lib/utils/got');
const config = require('../../lib/config').value;
const nock = require('nock');

describe('got', () => {
    it('headers', async () => {
        nock('http://rsshub.test')
            .get('/test')
            .reply(function() {
                expect(this.req.headers['user-agent']).toBe(config.ua);
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

        const response1 = await got.post('post', {
            baseUrl: 'http://rsshub.test/',
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
            responseType: 'buffer',
        });
    });
});
