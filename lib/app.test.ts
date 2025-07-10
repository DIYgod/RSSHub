import { describe, expect, it, vi } from 'vitest';

import app from '@/app';
import undici from 'undici';

const { config } = await import('@/config');

describe('index', () => {
    it('serve index', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        expect(await res.text()).toContain('Welcome to RSSHub!');
    });
});

describe('request-rewriter', () => {
    it('should rewrite request', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch');
        await app.request('/test/httperror');

        // headers
        const headers: Headers = fetchSpy.mock.lastCall?.[0].headers;
        expect(headers.get('user-agent')).toBe(config.ua);
    });
});
