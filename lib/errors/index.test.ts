import { describe, expect, it, afterAll } from 'vitest';
import supertest from 'supertest';
import server from '@/index';
import { load } from 'cheerio';
import { config } from '@/config';

const request = supertest(server);

afterAll(() => {
    server.close();
});

describe('error', () => {
    it(`error`, async () => {
        const response = await request.get('/test/error');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/Error: Error test/);
    });
});

describe('httperror', () => {
    it(`httperror`, async () => {
        const response = await request.get('/test/httperror');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(
            /Response code 404 \(Not Found\): target website might be blocking our access, you can <a href="https:\/\/docs\.rsshub\.app\/install\/">host your own RSSHub instance<\/a> for a better usability\./
        );
    }, 20000);
});

describe('RequestInProgressError', () => {
    it(`RequestInProgressError`, async () => {
        const responses = await Promise.all([request.get('/test/slow'), request.get('/test/slow')]);
        expect(new Set(responses.map((r) => r.status))).toEqual(new Set([200, 503]));
        expect(new Set(responses.map((r) => r.headers['cache-control']))).toEqual(new Set([`public, max-age=${config.cache.routeExpire}`, `public, max-age=${config.requestTimeout / 1000}`]));
        expect(responses.filter((r) => r.text.includes('This path is currently fetching, please come back later!'))).toHaveLength(1);
    });
});

describe('route throws an error', () => {
    it('route path error should have path mounted', async () => {
        await request.get('/test/error');
        await request.get('/thisDoesNotExist');
        const response = await request.get('/');

        const $ = load(response.text);
        $('.debug-item').each((index, item) => {
            const key = $(item).find('.debug-key').text().trim();
            const value = $(item).find('.debug-value').html()?.trim();
            switch (key) {
                case 'Request Amount:':
                    expect(value).toBe('7');
                    break;
                case 'Hot Routes:':
                    expect(value).toBe('4 /test/:id<br>');
                    break;
                case 'Hot Paths:':
                    expect(value).toBe('2 /test/error<br>2 /test/slow<br>1 /test/httperror<br>1 /thisDoesNotExist<br>1 /<br>');
                    break;
                case 'Hot Error Routes:':
                    expect(value).toBe('3 /test/:id<br>');
                    break;
                case 'Hot Error Paths:':
                    expect(value).toBe('2 /test/error<br>1 /test/httperror<br>1 /test/slow<br>1 /thisDoesNotExist<br>');
                    break;
                default:
            }
        });
    });
});
