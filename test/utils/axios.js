const axios = require('../../lib/utils/axios');
const MockAdapter = require('axios-mock-adapter');
const mock = new MockAdapter(axios);
const config = require('../../lib/config');

describe('axios', () => {
    it('axios headers', async () => {
        mock.onGet('/test').reply((axiosConfig) => {
            expect(axiosConfig.headers['User-Agent']).toBe(config.ua);
            expect(axiosConfig.headers['X-APP']).toBe('RSSHub');
            return [
                200,
                {
                    code: 0,
                },
            ];
        });

        const response = await axios.get('/test');
        expect(response.status).toBe(200);
        expect(response.data.code).toBe(0);
    });

    it('axios retry', async () => {
        const requestRun = jest.fn();
        let requestTime;

        mock.onGet('/test').reply(() => {
            requestRun();

            // retryDelay
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
            await axios.get('/test');
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.code).toBe(1);
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry + 1);
    });
});
