import { describe, expect, it, afterEach, vi } from 'vitest';
import nock from 'nock';

afterEach(() => {
    vi.resetModules();
});

describe('got', () => {
    it('headers', async () => {
        const { default: got } = await import('@/utils/got');
        const { config } = await import('@/config');
        nock('http://rsshub.test')
            .get('/test')
            .reply(function () {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                return [200, ''];
            });

        await got.get('http://rsshub.test/test');
    });

    it('retry', async () => {
        const { default: got } = await import('@/utils/got');
        const { config } = await import('@/config');
        const requestRun = vi.fn();
        nock('http://rsshub.test')
            .get('/testRerty')
            .times(config.requestRetry + 1)
            .reply(() => {
                requestRun();
                return [503, '0'];
            });

        try {
            await got.get('http://rsshub.test/testRerty');
        } catch (error: any) {
            expect(error.name).toBe('FetchError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry + 1);
    });

    it('axios', async () => {
        const { default: got } = await import('@/utils/got');
        nock('http://rsshub.test')
            .post('/post')
            .reply(() => [200, '{"code": 0}']);

        const response1 = await got.post('http://rsshub.test/post', {
            form: {
                test: 1,
            },
        });
        expect(response1.body).toBe('{"code": 0}');
        expect(response1.data.code).toBe(0);
    });
});
