import { renderToString } from 'hono/jsx/dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const envKeys = ['DEBUG_INFO', 'DISALLOW_ROBOT', 'NODE_NAME', 'CACHE_EXPIRE', 'HEROKU_SLUG_COMMIT'] as const;
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
    for (const key of envKeys) {
        if (originalEnv[key] === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = originalEnv[key];
        }
    }
    vi.resetModules();
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

        vi.resetModules();
        if (debugInfo === undefined) {
            delete process.env.DEBUG_INFO;
        } else {
            process.env.DEBUG_INFO = debugInfo;
        }
        process.env.DISALLOW_ROBOT = 'true';
        process.env.NODE_NAME = 'TestNode';
        process.env.CACHE_EXPIRE = '120';
        process.env.HEROKU_SLUG_COMMIT = 'abc123';

        const { setDebugInfo } = await import('@/utils/debug-info');
        setDebugInfo(debugData);

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
