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
        nock('http://rsshub.test')
            .get('/testRerty')
            .times(config.requestRetry + 1)
            .reply(function() {
                requestRun();
                return [404, '0'];
            });

        try {
            await got.get('http://rsshub.test/testRerty');
        } catch (error) {
            expect(error.name).toBe('HTTPError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry + 1);
    });

    it('axios', async () => {
        nock('http://rsshub.test')
            .post('/post')
            .reply(function() {
                return [200, '{"code": 0}'];
            });

        const response1 = await got.post('http://rsshub.test/post', {
            form: {
                test: 1,
            },
        });
        expect(response1.statusCode).toBe(200);
        expect(response1.status).toBe(200);
        expect(response1.body).toBe('{"code": 0}');
        expect(response1.data.code).toBe(0);
    });
});
