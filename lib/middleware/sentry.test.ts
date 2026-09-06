import { Context } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

type Scope = { setTag: ReturnType<typeof vi.fn> };

const makeContext = (path: string) => new Context(new Request(`http://localhost${path}`), { env: {}, path });

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.doUnmock('@sentry/node');
    delete process.env.SENTRY;
    delete process.env.SENTRY_ROUTE_TIMEOUT;
    delete process.env.NODE_NAME;
});

describe('sentry middleware', () => {
    const loadMiddleware = async () => {
        process.env.SENTRY = 'https://sentry.example/123';
        process.env.SENTRY_ROUTE_TIMEOUT = '50';
        process.env.NODE_NAME = 'node-a';

        const scope: Scope = { setTag: vi.fn() };
        const sentry = {
            init: vi.fn(),
            getCurrentScope: vi.fn(() => scope),
            withScope: vi.fn((cb: (scope: Scope) => void) => cb(scope)),
            captureException: vi.fn(),
        };

        vi.doMock('@sentry/node', () => sentry);

        const { default: logger } = await import('@/utils/logger');
        const infoSpy = vi.spyOn(logger, 'info');

        const { default: middleware } = await import('@/middleware/sentry');

        return { middleware, sentry, infoSpy, scope };
    };

    it('does not load sentry when dsn is not configured', async () => {
        const sentryFactory = vi.fn(() => ({ init: vi.fn() }));
        vi.doMock('@sentry/node', sentryFactory);
        process.env.SENTRY = '';

        const { default: middleware } = await import('@/middleware/sentry');
        await middleware(makeContext('/test/slow'), async () => {});

        expect(sentryFactory).not.toHaveBeenCalled();
    });

    it('initializes sentry and captures slow routes', async () => {
        const { middleware, sentry, infoSpy, scope } = await loadMiddleware();

        expect(sentry.init).toHaveBeenCalledWith({
            dsn: 'https://sentry.example/123',
        });
        expect(sentry.getCurrentScope).toHaveBeenCalledTimes(1);
        expect(scope.setTag).toHaveBeenCalledWith('node_name', 'node-a');
        expect(infoSpy).toHaveBeenCalledWith('Sentry inited.');

        const ctx = makeContext('/test/slow');
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(100);

        await middleware(ctx, async () => {});

        expect(scope.setTag).toHaveBeenCalledWith('name', 'test');
        expect(sentry.captureException).toHaveBeenCalledTimes(1);
    });
});
