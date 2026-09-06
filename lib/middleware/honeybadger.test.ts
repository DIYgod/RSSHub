import { Context } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete process.env.HONEYBADGER_API_KEY;
    delete process.env.ERROR_TRACKING_ROUTE_TIMEOUT;
    delete process.env.NODE_NAME;
});

describe('honeybadger middleware', () => {
    it('initializes honeybadger and captures slow routes', async () => {
        process.env.HONEYBADGER_API_KEY = 'hbp_test_key';
        process.env.ERROR_TRACKING_ROUTE_TIMEOUT = '50';
        process.env.NODE_NAME = 'node-a';

        const { default: honeybadger } = await import('@honeybadger-io/js');
        const configureSpy = vi.spyOn(honeybadger, 'configure').mockReturnValue(honeybadger);
        const setContextSpy = vi.spyOn(honeybadger, 'setContext').mockReturnValue(honeybadger);
        const notifySpy = vi.spyOn(honeybadger, 'notify').mockReturnValue(false);

        const { default: logger } = await import('@/utils/logger');
        const infoSpy = vi.spyOn(logger, 'info');

        const { default: middleware } = await import('@/middleware/honeybadger');

        expect(configureSpy).toHaveBeenCalledWith({
            apiKey: 'hbp_test_key',
            enableUncaught: false,
        });
        expect(setContextSpy).toHaveBeenCalledWith({ node_name: 'node-a' });
        expect(infoSpy).toHaveBeenCalledWith('Honeybadger inited.');

        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(100);

        const ctx = new Context(new Request('http://localhost/test/slow'), { env: {}, path: '/test/slow' });
        await middleware(ctx, () => Promise.resolve());

        expect(notifySpy).toHaveBeenCalledTimes(1);
        expect(notifySpy).toHaveBeenCalledWith(expect.any(Error), {
            context: { name: 'test' },
        });
    });
});
