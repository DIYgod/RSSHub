import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import got from '@/utils/got';
import { config } from '@/config';
import { Cookie, CookieJar } from 'tough-cookie';

describe('got', () => {
    it('headers', async () => {
        const { data } = await got('http://rsshub.test/headers');
        expect(data['user-agent']).toBe(config.ua);
    });

    it('retry', async () => {
        const requestRun = vi.fn();
        const { default: server } = await import('@/setup.test');
        server.use(
            http.get(`http://rsshub.test/retry-test`, () => {
                requestRun();
                return HttpResponse.error();
            })
        );

        try {
            await got.get('http://rsshub.test/retry-test');
        } catch (error: any) {
            expect(error.name).toBe('FetchError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry + 1);
    });

    it('form-post', async () => {
        const response = await got.post('http://rsshub.test/form-post', {
            form: {
                test: 'rsshub',
            },
        });
        expect(response.body).toContain('"test":"rsshub"');
        expect(response.data.test).toBe('rsshub');
        expect(response.data.req.headers['content-type']).toBe('application/x-www-form-urlencoded');
    });

    it('json-post', async () => {
        const response = await got.post('http://rsshub.test/json-post', {
            json: {
                test: 'rsshub',
            },
        });
        expect(response.body).toBe('{"test":"rsshub"}');
        expect(response.data.test).toBe('rsshub');
    });

    it('buffer-get', async () => {
        const response = await got.get('http://example.com', {
            responseType: 'buffer',
        });
        expect(response.body instanceof Buffer).toBe(true);
        expect(response.data instanceof Buffer).toBe(true);
    });

    it('cookieJar', async () => {
        const cookieJar = new CookieJar();
        const cookie = Cookie.fromJSON({
            key: 'cookie',
            value: 'test',
            domain: 'rsshub.test',
            path: '/',
        });
        cookie && cookieJar.setCookie(cookie, 'http://rsshub.test');
        const { data } = await got.get('http://rsshub.test/headers', {
            cookieJar,
        });

        expect(data.cookie).toBe('cookie=test; Domain=rsshub.test; Path=/');
    });
});
