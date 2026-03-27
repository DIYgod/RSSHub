import { afterEach, describe, expect, it, vi } from 'vitest';

import md5 from '@/utils/md5';

process.env.NODE_NAME = 'mock';

async function checkBlock(response) {
    expect(response.status).toBe(403);
    expect(await response.text()).toMatch(/Access denied\./);
}

afterEach(() => {
    delete process.env.ACCESS_KEY;
    vi.resetModules();
});

describe('access-control', () => {
    it(`access key`, async () => {
        const key = '1L0veRSSHub';
        const code = md5('/test/2' + key);
        process.env.ACCESS_KEY = key;
        const app = (await import('@/app')).default;

        const response01 = await app.request('/');
        expect(response01.status).toBe(200);

        const response02 = await app.request('/robots.txt');
        expect(response02.status).toBe(404);

        // no key/code
        const response21 = await app.request('/test/2');
        await checkBlock(response21);

        // wrong key/code
        const response321 = await app.request(`/test/2?key=wrong+${key}`);
        await checkBlock(response321);

        const response322 = await app.request(`/test/2?code=wrong+${code}`);
        await checkBlock(response322);

        // right key/code
        const response331 = await app.request(`/test/2?key=${key}`);
        expect(response331.status).toBe(200);

        const response332 = await app.request(`/test/2?code=${code}`);
        expect(response332.status).toBe(200);
    });
});
