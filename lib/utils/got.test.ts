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
            expect(error.name).toBe('HTTPError');
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
        expect(response1.statusCode).toBe(200);
        // @ts-expect-error custom property
        expect(response1.status).toBe(200);
        expect(response1.body).toBe('{"code": 0}');
        // @ts-expect-error custom property
        expect(response1.data.code).toBe(0);
    });

    it('timeout', async () => {
        process.env.REQUEST_TIMEOUT = '500';

        const { default: got } = await import('@/utils/got');
        nock('http://rsshub.test')
            .get('/timeout')
            .delay(600)
            .reply(() => [200, '{"code": 0}']);

        const logger = (await import('@/utils/logger')).default;
        // @ts-expect-error unused
        const loggerSpy = vi.spyOn(logger, 'error').mockReturnValue({});

        try {
            await got.get('http://rsshub.test/timeout');
            throw new Error('Timeout Invalid');
        } catch (error: any) {
            expect(error.name).toBe('RequestError');
        }
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('http://rsshub.test/timeout'));

        loggerSpy.mockRestore();

        delete process.env.REQUEST_TIMEOUT;
    });
});
