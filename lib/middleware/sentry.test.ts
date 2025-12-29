import { afterEach, describe, expect, it, vi } from 'vitest';

type Scope = { setTag: ReturnType<typeof vi.fn> };

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unmock('@/config');
    vi.unmock('@/utils/helpers');
    vi.unmock('@/utils/logger');
    vi.unmock('@sentry/node');
});

describe('sentry middleware', () => {
    const loadMiddleware = async () => {
        const scope: Scope = { setTag: vi.fn() };
        const sentry = {
            init: vi.fn(),
            getCurrentScope: vi.fn(() => scope),
            withScope: vi.fn((cb: (scope: Scope) => void) => cb(scope)),
            captureException: vi.fn(),
        };
        const logger = {
            info: vi.fn(),
        };
        const getRouteNameFromPath = vi.fn((path: string) => `route:${path}`);

        vi.doMock('@sentry/node', () => sentry);
        vi.doMock('@/utils/logger', () => ({
            default: logger,
        }));
        vi.doMock('@/utils/helpers', () => ({
            getRouteNameFromPath,
        }));
        vi.doMock('@/config', () => ({
            config: {
                sentry: {
                    dsn: 'https://sentry.example/123',
                    routeTimeout: 50,
                },
                nodeName: 'node-a',
            },
        }));

        const { default: middleware } = await import('@/middleware/sentry');

        return { middleware, sentry, logger, scope, getRouteNameFromPath };
    };

    it('initializes sentry and captures slow routes', async () => {
        const { middleware, sentry, logger, scope, getRouteNameFromPath } = await loadMiddleware();

        expect(sentry.init).toHaveBeenCalledWith({
            dsn: 'https://sentry.example/123',
        });
        expect(sentry.getCurrentScope).toHaveBeenCalledTimes(1);
        expect(scope.setTag).toHaveBeenCalledWith('node_name', 'node-a');
        expect(logger.info).toHaveBeenCalledWith('Sentry inited.');

        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(100);

        await middleware({ req: { path: '/test/slow' } } as any, async () => {});

        expect(getRouteNameFromPath).toHaveBeenCalledWith('/test/slow');
        expect(scope.setTag).toHaveBeenCalledWith('name', 'route:/test/slow');
        expect(sentry.captureException).toHaveBeenCalledTimes(1);
    });
});
