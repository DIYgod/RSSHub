import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';

import app from '@/app';
import { config } from '@/config';

describe('error', () => {
    it(`error`, async () => {
        const response = await app.request('/test/error');
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).toMatch(/Error: Error test/);
    });
});

describe('httperror', () => {
    it(`httperror`, async () => {
        const response = await app.request('/test/httperror');
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).toContain('FetchError: [GET] &quot;https://httpbingo.org/status/404&quot;: 404 Not Found');
    }, 20000);
});

describe('RequestInProgressError', () => {
    it(`RequestInProgressError with retry`, async () => {
        const responses = await Promise.all([app.request('/test/slow'), app.request('/test/slow')]);
        expect(new Set(responses.map((r) => r.status))).toEqual(new Set([200, 200]));
    });
    it(`RequestInProgressError`, async () => {
        const responses = await Promise.all([app.request('/test/slow4'), app.request('/test/slow4')]);
        expect(new Set(responses.map((r) => r.status))).toEqual(new Set([200, 503]));
        expect(new Set(responses.map((r) => r.headers.get('cache-control')))).toEqual(new Set([`public, max-age=${config.cache.routeExpire}`, `public, max-age=${config.requestTimeout / 1000}`]));
        const texts = await Promise.all(responses.map((r) => r.text()));
        expect(texts.filter((t) => t.includes('RequestInProgressError: This path is currently fetching, please come back later!'))).toHaveLength(1);
    });
});

describe('config-not-found-error', () => {
    it(`config-not-found-error`, async () => {
        const response = await app.request('/test/config-not-found-error');
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).toMatch('ConfigNotFoundError: Test config not found error');
    }, 20000);
});

describe('invalid-parameter-error', () => {
    it(`invalid-parameter-error`, async () => {
        const response = await app.request('/test/invalid-parameter-error');
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).toMatch('InvalidParameterError: Test invalid parameter error');
    }, 20000);
});

describe('captcha-error', () => {
    it(`captcha-error`, async () => {
        const response = await app.request('/test/captcha-error');
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).toMatch('CaptchaError: Test captcha error');
    }, 20000);
});

describe('route throws an error', () => {
    it('route path error should have path mounted', async () => {
        await app.request('/test/error');
        await app.request('/thisDoesNotExist');
        const response = await app.request('/');

        const text = await response.text();
        const $ = load(text);
        $('.debug-item').each((_index, item) => {
            const key = $(item).find('.debug-key').text().trim();
            const value = $(item).find('.debug-value').html()?.trim();
            switch (key) {
                case 'Request Amount:':
                    expect(value).toBe('12');
                    break;
                case 'Hot Routes:':
                    expect(value).toBe('9 /test/:id/:params?<br>');
                    break;
                case 'Hot Paths:':
                    expect(value).toBe(
                        '2 /test/error<br>2 /test/slow<br>2 /test/slow4<br>1 /test/httperror<br>1 /test/config-not-found-error<br>1 /test/invalid-parameter-error<br>1 /test/captcha-error<br>1 /thisDoesNotExist<br>1 /<br>'
                    );
                    break;
                case 'Hot Error Routes:':
                    expect(value).toBe('6 /test/:id/:params?<br>');
                    break;
                case 'Hot Error Paths:':
                    expect(value).toBe('2 /test/error<br>1 /test/httperror<br>1 /test/slow4<br>1 /test/config-not-found-error<br>1 /test/invalid-parameter-error<br>1 /test/captcha-error<br>1 /thisDoesNotExist<br>');
                    break;
                default:
            }
        });
    });
});
