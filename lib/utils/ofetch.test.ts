import http from 'node:http';

import { http as mswHttp, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadOfetchWithLogger = async () => {
    vi.resetModules();
    const { default: logger } = await import('@/utils/logger');
    const { default: ofetch } = await import('@/utils/ofetch');
    return { logger, ofetch };
};

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('ofetch', () => {
    it('marks prefer-proxy header on retryable responses', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(mswHttp.get('http://rsshub.test/fail-500', () => HttpResponse.text('fail', { status: 500 })));

        const { logger, ofetch } = await loadOfetchWithLogger();
        const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);

        await expect(
            ofetch('http://rsshub.test/fail-500', {
                retry: 1,
                retryDelay: 0,
                onResponse({ options }) {
                    options.headers = null as unknown as Headers;
                },
            })
        ).rejects.toBeDefined();

        expect(warnSpy).toHaveBeenCalled();
    });

    it('logs redirected responses', async () => {
        const { logger, ofetch } = await loadOfetchWithLogger();
        const httpSpy = vi.spyOn(logger, 'http').mockImplementation(() => logger);

        const server = http.createServer((req, res) => {
            if (req.url === '/redirect') {
                res.statusCode = 302;
                res.setHeader('Location', '/target');
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end('ok');
        });

        await new Promise<void>((resolve) => server.listen(0, resolve));
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        try {
            await ofetch(`http://127.0.0.1:${port}/redirect`);
        } finally {
            server.close();
        }

        expect(httpSpy).toHaveBeenCalled();
    });
});
