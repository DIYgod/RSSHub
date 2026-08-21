import { renderToString } from 'hono/jsx/dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
    vi.unmock('@/config');
    vi.unmock('@/utils/debug-info');
    vi.unmock('@/utils/git-hash');
});

describe('Index view', () => {
    const renderIndex = async (debugInfo: string | undefined, debugQuery: string | undefined) => {
        const debugData = {
            hitCache: 2,
            request: 10,
            etag: 3,
            error: 1,
            routes: {
                '/foo': 5,
                '/bar': 2,
            },
            paths: {
                '/foo?x=1': 4,
                '/bar?x=2': 1,
            },
            errorRoutes: {
                '/error': 2,
                '/fail': 1,
            },
            errorPaths: {
                '/error?x=1': 1,
                '/fail?x=2': 1,
            },
        };

        vi.doMock('@/config', () => ({
            config: {
                debugInfo,
                disallowRobot: true,
                nodeName: 'TestNode',
                cache: {
                    routeExpire: 120,
                },
            },
        }));
        vi.doMock('@/utils/debug-info', () => ({
            getDebugInfo: () => debugData,
        }));
        vi.doMock('@/utils/git-hash', () => ({
            gitHash: 'abc123',
            gitDate: new Date('2020-01-01T00:00:00Z'),
        }));

        const { default: Index } = await import('@/views/index');

        return renderToString(<Index debugQuery={debugQuery} />);
    };

    it('shows debug info when enabled', async () => {
        const html = await renderIndex('secret', 'secret');

        expect(html).toContain('Debug Info');
        expect(html).toContain('TestNode');
        expect(html).toContain('abc123');
        expect(html).toContain('5 /foo');
        expect(html).toContain('2 /error');
    });

    it('hides debug info when disabled', async () => {
        const html = await renderIndex('false', 'secret');

        expect(html).not.toContain('Debug Info');
    });
});
