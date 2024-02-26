import { describe, expect, it, jest, afterEach, afterAll, beforeAll } from '@jest/globals';
import supertest from 'supertest';
import Parser from 'rss-parser';
import wait from '@/utils/wait';
import type { serve } from '@hono/node-server';

const parser = new Parser();
let server: ReturnType<typeof serve>;

beforeAll(() => {
    process.env.CACHE_EXPIRE = '1';
    process.env.CACHE_CONTENT_EXPIRE = '3';
});

afterEach(() => {
    delete process.env.CACHE_TYPE;
    jest.resetModules();
    server?.close();
});

afterAll(() => {
    delete process.env.CACHE_EXPIRE;
});

describe('cache', () => {
    it('memory', async () => {
        process.env.CACHE_TYPE = 'memory';
        server = (await import('@/index')).default;
        const request = supertest(server);

        const response1 = await request.get('/test/cache');
        const response2 = await request.get('/test/cache');

        const parsed1 = await parser.parseString(response1.text);
        const parsed2 = await parser.parseString(response2.text);

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers['rsshub-cache-status']).toBe('HIT');

        await wait(1 * 1000 + 100);
        const response3 = await request.get('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(response3.text);

        await wait(3 * 1000 + 100);
        const response4 = await request.get('/test/cache');
        const parsed4 = await parser.parseString(response4.text);

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await request.get('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await request.get('/test/refreshCache');
        const parsed5 = await parser.parseString(response5.text);
        await wait(2 * 1000 + 100);
        const response6 = await request.get('/test/refreshCache');
        const parsed6 = await parser.parseString(response6.text);

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');
    }, 10000);

    it('redis', async () => {
        process.env.CACHE_TYPE = 'redis';
        server = (await import('@/index')).default;
        const request = supertest(server);

        const response1 = await request.get('/test/cache');
        const response2 = await request.get('/test/cache');

        const parsed1 = await parser.parseString(response1.text);
        const parsed2 = await parser.parseString(response2.text);

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers['rsshub-cache-status']).toBe('HIT');

        await wait(1 * 1000 + 100);
        const response3 = await request.get('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(response3.text);

        await wait(3 * 1000 + 100);
        const response4 = await request.get('/test/cache');
        const parsed4 = await parser.parseString(response4.text);

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await request.get('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await request.get('/test/refreshCache');
        const parsed5 = await parser.parseString(response5.text);
        await wait(2 * 1000 + 100);
        const response6 = await request.get('/test/refreshCache');
        const parsed6 = await parser.parseString(response6.text);

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');

        const cache = (await import('@/utils/cache')).default;
        await cache.clients.redisClient!.quit();
    }, 10000);

    it('redis with quit', async () => {
        process.env.CACHE_TYPE = 'redis';
        server = (await import('@/index')).default;
        const cache = (await import('@/utils/cache')).default;
        await cache.clients.redisClient!.quit();
        const request = supertest(server);

        const response1 = await request.get('/test/cache');
        const response2 = await request.get('/test/cache');

        const parsed1 = await parser.parseString(response1.text);
        const parsed2 = await parser.parseString(response2.text);

        expect(response2.status).toBe(200);
        expect(response2.headers).not.toHaveProperty('rsshub-cache-status');

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache2');
    });

    it('redis with error', async () => {
        process.env.CACHE_TYPE = 'redis';
        process.env.REDIS_URL = 'redis://wrongpath:6379';
        server = (await import('@/index')).default;
        const request = supertest(server);

        const response1 = await request.get('/test/cache');
        const response2 = await request.get('/test/cache');

        const parsed1 = await parser.parseString(response1.text);
        const parsed2 = await parser.parseString(response2.text);

        expect(response2.status).toBe(200);
        expect(response2.headers).not.toHaveProperty('rsshub-cache-status');

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache2');

        const cache = (await import('@/utils/cache')).default;
        await cache.clients.redisClient!.quit();
    });

    it('no cache', async () => {
        process.env.CACHE_TYPE = 'NO';
        server = (await import('@/index')).default;
        const request = supertest(server);

        const response1 = await request.get('/test/cache');
        const response2 = await request.get('/test/cache');

        const parsed1 = await parser.parseString(response1.text);
        const parsed2 = await parser.parseString(response2.text);

        expect(response2.status).toBe(200);
        expect(response2.headers).not.toHaveProperty('rsshub-cache-status');

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache2');
    });

    it('throws URL key', async () => {
        process.env.CACHE_TYPE = 'memory';
        server = (await import('@/index')).default;
        const request = supertest(server);

        try {
            const response = await request.get('/test/cacheUrlKey');
            expect(response).toThrow(Error);
        } catch (error: any) {
            expect(error.message).toContain('Cache key must be a string');
        }
    });
});
