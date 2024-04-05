import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';

describe('ofetch', () => {
    it('headers', async () => {
        const data = await ofetch('http://rsshub.test/headers');
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
            await ofetch('http://rsshub.test/retry-test');
        } catch (error: any) {
            expect(error.name).toBe('FetchError');
        }

        // retries
        expect(requestRun).toHaveBeenCalledTimes(config.requestRetry + 1);
    });

    it('form-post', async () => {
        const body = new FormData();
        body.append('test', 'rsshub');
        const response = await ofetch('http://rsshub.test/form-post', {
            method: 'POST',
            body,
        });
        expect(response.test).toBe('rsshub');
    });

    it('json-post', async () => {
        const response = await ofetch('http://rsshub.test/json-post', {
            method: 'POST',
            body: {
                test: 'rsshub',
            },
        });
        expect(response.test).toBe('rsshub');
    });
});
