import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unmock('@/config');
    vi.unmock('@/utils/helpers');
    vi.unmock('@/utils/logger');
    vi.unmock('@honeybadger-io/js');
});

describe('honeybadger middleware', () => {
    const loadMiddleware = async () => {
        const honeybadger = {
            configure: vi.fn(),
            setContext: vi.fn(),
            notify: vi.fn(),
        };
        const logger = {
            info: vi.fn(),
        };
        const getRouteNameFromPath = vi.fn((path: string) => `route:${path}`);

        vi.doMock('@honeybadger-io/js', () => ({
            default: honeybadger,
        }));
        vi.doMock('@/utils/logger', () => ({
            default: logger,
        }));
        vi.doMock('@/utils/helpers', () => ({
            getRouteNameFromPath,
        }));
        vi.doMock('@/config', () => ({
            config: {
                honeybadger: {
                    apiKey: 'hbp_test_key',
                },
                errorTrackingRouteTimeout: 50,
                nodeName: 'node-a',
            },
        }));

        const { default: middleware } = await import('@/middleware/honeybadger');

        return { middleware, honeybadger, logger, getRouteNameFromPath };
    };

    it('initializes honeybadger and captures slow routes', async () => {
        const { middleware, honeybadger, logger, getRouteNameFromPath } = await loadMiddleware();

        expect(honeybadger.configure).toHaveBeenCalledWith({
            apiKey: 'hbp_test_key',
        });
        expect(honeybadger.setContext).toHaveBeenCalledWith({ node_name: 'node-a' });
        expect(logger.info).toHaveBeenCalledWith('Honeybadger inited.');

        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(100);

        await middleware({ req: { path: '/test/slow' } } as any, async () => {});

        expect(getRouteNameFromPath).toHaveBeenCalledWith('/test/slow');
        expect(honeybadger.notify).toHaveBeenCalledTimes(1);
        expect(honeybadger.notify).toHaveBeenCalledWith(expect.any(Error), {
            context: { name: 'route:/test/slow' },
        });
    });
});
