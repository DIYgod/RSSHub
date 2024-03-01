import { describe, expect, it, jest, afterEach } from '@jest/globals';
import md5 from '@/utils/md5';

process.env.NODE_NAME = 'mock';

async function checkBlock(response) {
    expect(response.status).toBe(403);
    expect(await response.text()).toMatch(/Access denied\./);
}

afterEach(() => {
    delete process.env.ACCESS_KEY;
    delete process.env.DENYLIST;
    delete process.env.ALLOWLIST;
    jest.resetModules();
});

describe('access-control', () => {
    it(`denylist`, async () => {
        const key = '1L0veRSSHub';
        const code = md5('/test/2' + key);
        process.env.DENYLIST = 'est/1,233.233.233.,black';
        process.env.ACCESS_KEY = key;
        const app = (await import('@/app')).default;

        const response11 = await app.request('/test/1');
        await checkBlock(response11);

        const response12 = await app.request('/test/1', {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        await checkBlock(response12);

        const response13 = await app.request('/test/1', {
            headers: {
                'user-agent': 'blackua',
            },
        });
        await checkBlock(response13);

        const response21 = await app.request('/test/2');
        expect(response21.status).toBe(200);

        const response22 = await app.request('/test/2', {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        await checkBlock(response22);

        const response23 = await app.request('/test/2', {
            headers: {
                'user-agent': 'blackua',
            },
        });
        await checkBlock(response23);

        // wrong key/code, not on denylist
        const response311 = await app.request(`/test/2?key=wrong+${key}`);
        expect(response311.status).toBe(200);

        const response312 = await app.request(`/test/2?code=wrong+${code}`);
        expect(response312.status).toBe(200);

        // wrong key/code, on denylist
        const response321 = await app.request(`/test/2?key=wrong+${key}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        await checkBlock(response321);

        const response322 = await app.request(`/test/2?code=wrong+${code}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        await checkBlock(response322);

        // right key/code, on denylist
        const response331 = await app.request(`/test/2?key=${key}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response331.status).toBe(200);

        const response332 = await app.request(`/test/2?code=${code}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response332.status).toBe(200);
    });

    it(`allowlist`, async () => {
        const key = '1L0veRSSHub';
        const code = md5('/test/2' + key);
        process.env.ALLOWLIST = 'est/1,233.233.233.,103.31.4.0/22,white';
        process.env.ACCESS_KEY = key;
        const app = (await import('@/app')).default;

        const response01 = await app.request('/');
        expect(response01.status).toBe(200);

        const response02 = await app.request('/robots.txt');
        expect(response02.status).toBe(404);

        const response11 = await app.request('/test/1');
        expect(response11.status).toBe(200);

        const response12 = await app.request('/test/1', {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response12.status).toBe(200);

        const response13 = await app.request('/test/1', {
            headers: {
                'user-agent': 'whiteua',
            },
        });
        expect(response13.status).toBe(200);

        const response21 = await app.request('/test/2');
        await checkBlock(response21);

        const response22 = await app.request('/test/2', {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response22.status).toBe(200);

        const response221 = await app.request('/test/2', {
            headers: {
                'X-Mock-IP': '103.31.4.0',
            },
        });
        expect(response221.status).toBe(200);

        const response222 = await app.request('/test/2', {
            headers: {
                'X-Mock-IP': '103.31.7.255',
            },
        });
        expect(response222.status).toBe(200);

        const response223 = await app.request('/test/2', {
            headers: {
                'X-Mock-IP': '103.31.8.0',
            },
        });
        await checkBlock(response223);

        const response23 = await app.request('/test/2', {
            headers: {
                'user-agent': 'whiteua',
            },
        });
        expect(response23.status).toBe(200);

        // wrong key/code, not on allowlist
        const response311 = await app.request(`/test/2?code=wrong+${code}`);
        await checkBlock(response311);

        const response312 = await app.request(`/test/2?key=wrong+${key}`);
        await checkBlock(response312);

        // wrong key/code, on allowlist
        const response321 = await app.request(`/test/2?code=wrong+${code}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response321.status).toBe(200);

        const response322 = await app.request(`/test/2?key=wrong+${key}`, {
            headers: {
                'X-Mock-IP': '233.233.233.233',
            },
        });
        expect(response322.status).toBe(200);

        // right key/code
        const response331 = await app.request(`/test/2?code=${code}`);
        expect(response331.status).toBe(200);

        const response332 = await app.request(`/test/2?key=${key}`);
        expect(response332.status).toBe(200);
    });

    it(`no list`, async () => {
        const key = '1L0veRSSHub';
        const code = md5('/test/2' + key);
        process.env.ACCESS_KEY = key;
        const app = (await import('@/app')).default;

        const response01 = await app.request('/');
        expect(response01.status).toBe(200);

        const response02 = await app.request('/robots.txt');
        expect(response02.status).toBe(404);

        const response11 = await app.request('/test/1');
        await checkBlock(response11);

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
