import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Page } from 'patchright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { fetchWithPage } from '@/utils/playwright-request';

const fakePage = (cookies: Array<{ name: string; value: string; domain: string; path: string }>) =>
    ({
        context: () => ({ cookies: () => Promise.resolve(cookies) }),
        evaluate: () => Promise.resolve('Browser UA'),
    }) as unknown as Page;

describe('fetchWithPage', () => {
    let server: http.Server;
    let origin: string;
    const received: http.IncomingHttpHeaders[] = [];

    beforeAll(async () => {
        server = http.createServer((req, res) => {
            received.push(req.headers);
            res.writeHead(req.url === '/missing' ? 404 : 200).end(`body of ${req.url}`);
        });
        await once(server.listen(0, '127.0.0.1'), 'listening');
        origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(() => {
        server.close();
    });

    it('sends the cookies and user agent of the page', async () => {
        const response = await fetchWithPage(fakePage([{ name: 'a', value: '1', domain: '127.0.0.1', path: '/' }]), `${origin}/detail`);

        expect(response).toEqual({ ok: true, status: 200, text: 'body of /detail' });
        expect(received.at(-1)?.cookie).toBe('a=1');
        expect(received.at(-1)?.['user-agent']).toBe('Browser UA');
    });

    it('returns an error status instead of throwing', async () => {
        const response = await fetchWithPage(fakePage([]), `${origin}/missing`);

        expect(response).toEqual({ ok: false, status: 404, text: 'body of /missing' });
        expect(received.at(-1)?.cookie).toBeUndefined();
    });
});
