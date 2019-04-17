const axios = require('../../lib/utils/axios');
const config = require('../../lib/config');
const nock = require('nock');
describe('axios', () => {
    it('axios headers', async () => {
        nock('http://fortest.com')
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

        const response = await axios.get('http://fortest.com/test');
        expect(response.status).toBe(200);
        expect(response.data.code).toBe(0);
    });

    it('axios retry', async () => {
        const requestRun = jest.fn();
        let requestTime;
        nock('http://fortest.com')
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
            await axios.get('http://fortest.com/testRerty');
        } catch (error) {
            expect(error.name).toBe('RequestError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry);
    });
});
