import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import fetchWithPlaywrightRetry from './playwright-fetch';

const { settings, getPage, warn } = vi.hoisted(() => ({
    settings: { playwrightWSEndpoint: 'wss://browser.test/playwright?token=endpoint-fixture', requestTimeout: 30000 },
    getPage: vi.fn(),
    warn: vi.fn(),
}));

vi.mock('@/config', () => ({ config: settings }));
vi.mock('@/utils/playwright', () => ({ getPlaywrightPage: getPage }));
vi.mock('@/utils/logger', () => ({ default: { warn } }));

const biliUrl = 'https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1';
const rankingUrl = 'https://app-api.pixiv.net/v1/illust/ranking?mode=week_r18&filter=for_ios';
const dynamicUrl = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=2267573&features=itemOpusStyle%2ClistOnlyfans';
const videosUrl = 'https://api.bilibili.com/x/space/wbi/arc/search?mid=946974&ps=30&pn=1&w_rid=signed-fixture';
const userIllustsUrl = 'https://app-api.pixiv.net/v1/user/illusts?user_id=15288095&filter=for_ios';
const searchUrl = 'https://app-api.pixiv.net/v1/search/illust?word=%E7%8C%AB%20%26%20dog&sort=date_desc&filter=for_ios';
const popularSearchUrl = 'https://app-api.pixiv.net/v1/search/popular-preview/illust?word=Nezuko&filter=for_ios';
const oauthUrl = 'https://oauth.secure.pixiv.net/auth/token';
const form = 'grant_type=refresh_token&refresh_token=refresh-fixture%2Bvalue&client_secret=client-fixture';

function makeBrowser(url: string, body = '{"items":[{"id":1}]}', status = 200) {
    let paused: (event: any) => void;
    const session = {
        on: vi.fn((_event, listener) => {
            paused = listener;
        }),
        send: vi.fn((method: string, _params?: any) => Promise.resolve(method === 'Page.getFrameTree' ? { frameTree: { frame: { id: 'main-frame' } } } : {})),
    };
    const emit = (overrides: Record<string, unknown> = {}) => paused({ requestId: 'original', request: { url }, frameId: 'main-frame', resourceType: 'Document', ...overrides });
    const response = {
        url: () => url,
        body: vi.fn(() => Promise.resolve(Buffer.from(body))),
        headersArray: vi.fn(() =>
            Promise.resolve([
                { name: 'Content-Type', value: 'application/json; charset=utf-8' },
                { name: 'Content-Encoding', value: 'gzip' },
                { name: 'Content-Length', value: '1234' },
                { name: 'Connection', value: 'keep-alive, x-private-hop' },
                { name: 'Keep-Alive', value: 'timeout=30' },
                { name: 'X-Private-Hop', value: 'upstream-only' },
                { name: 'Transfer-Encoding', value: 'chunked' },
                { name: 'Cache-Control', value: 'no-store' },
            ])
        ),
        status: () => status,
        statusText: () => (status === 200 ? 'OK' : 'Forbidden'),
    };
    const page = {
        goto: vi.fn(() => {
            emit();
            return Promise.resolve(response);
        }),
    };
    const instance = { page, context: { newCDPSession: vi.fn(() => Promise.resolve(session)) }, destroy: vi.fn(() => Promise.resolve()) };
    getPage.mockResolvedValue(instance);
    return { instance, session, page, response, emit };
}

function oauthRequest(body = form) {
    return new Request(oauthUrl, { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'PixivIOSApp/fixture', authorization: 'Bearer authorization-fixture' } });
}

beforeEach(() => {
    settings.playwrightWSEndpoint = 'wss://browser.test/playwright?token=endpoint-fixture';
    settings.requestTimeout = 30000;
    getPage.mockReset();
    warn.mockReset();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('targeted Playwright fetch retry', () => {
    it.each([
        [biliUrl, 'GET', 200],
        [biliUrl, 'GET', 403],
        [biliUrl, 'POST', 412],
        ['https://api.bilibili.com/x/other', 'GET', 412],
        ['https://api.bilibili.com.evil.test/x/web-interface/popular', 'GET', 412],
        ['http://api.bilibili.com/x/web-interface/popular', 'GET', 412],
        ['https://api.bilibili.com:8443/x/web-interface/popular', 'GET', 412],
        [rankingUrl, 'GET', 401],
        [rankingUrl, 'GET', 412],
        [dynamicUrl, 'GET', 200],
        [videosUrl, 'POST', 412],
        [videosUrl.replace('pn=1', 'pn=2'), 'GET', 412],
        [userIllustsUrl, 'GET', 401],
        [searchUrl, 'GET', 200],
        [popularSearchUrl, 'POST', 403],
        ['https://app-api.pixiv.net/v1/search/illust/other', 'GET', 403],
        ['https://app-api.pixiv.net.evil.test/v1/user/illusts', 'GET', 403],
        ['https://app-api.pixiv.net/v1/user/bookmarks/illust', 'GET', 403],
        [oauthUrl, 'GET', 403],
        [oauthUrl, 'POST', 403],
        ['https://oauth.secure.pixiv.net/auth/other', 'POST', 403],
    ])('does not replay %s %s status %s', async (url, method, status) => {
        const response = new Response('original', { status: status as number });
        const native = vi.fn(() => Promise.resolve(response));
        const request = new Request(url as string, { method: method as string });

        expect(await fetchWithPlaywrightRetry(request, native)).toBe(response);
        expect(getPage).not.toHaveBeenCalled();
        expect(native).toHaveBeenCalledTimes(1);
        expect(await response.text()).toBe('original');
    });

    it('preserves native behavior when no WS endpoint is configured', async () => {
        settings.playwrightWSEndpoint = '';
        const request = oauthRequest();
        const response = new Response('original', { status: 403 });
        const native = vi.fn(() => Promise.resolve(response));

        expect(await fetchWithPlaywrightRetry(request, native)).toBe(response);
        expect(native).toHaveBeenCalledWith(request);
        expect(request.redirect).toBe('follow');
        expect(getPage).not.toHaveBeenCalled();
    });

    it.each([
        [biliUrl, 412],
        [rankingUrl, 403],
        [dynamicUrl, 412],
        [videosUrl, 412],
        [userIllustsUrl, 403],
        [searchUrl, 403],
        [popularSearchUrl, 403],
    ])('replays one allowlisted GET and preserves response data for %s', async (url, status) => {
        const { instance, session } = makeBrowser(url as string);
        const request = new Request(url as string, { headers: { authorization: 'Bearer fixture', cookie: 'SESSDATA=cookie-fixture', 'user-agent': 'upstream-client', referer: 'https://source.test/' } });
        const native = vi.fn(() => Promise.resolve(new Response('denied', { status: status as number })));

        const response = await fetchWithPlaywrightRetry(request, native);

        expect(await response.json()).toEqual({ items: [{ id: 1 }] });
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
        expect(response.headers.get('cache-control')).toBe('no-store');
        for (const name of ['content-encoding', 'content-length', 'connection', 'keep-alive', 'transfer-encoding', 'x-private-hop']) {
            expect(response.headers.has(name)).toBe(false);
        }
        expect(getPage).toHaveBeenCalledExactlyOnceWith(url, { useConfiguredEndpoint: true, javaScriptEnabled: false, noGoto: true, closeTimeout: 0 });
        const replay = session.send.mock.calls.filter(([method]) => method === 'Fetch.continueRequest');
        expect(replay).toHaveLength(1);
        expect(replay[0][1]).toEqual({ requestId: 'original', method: 'GET', headers: Array.from(request.headers, ([name, value]) => ({ name, value })) });
        expect(native).toHaveBeenCalledTimes(1);
        expect(instance.destroy).toHaveBeenCalledTimes(1);
    });

    it('captures a small OAuth form before native fetch consumes it', async () => {
        const { session, instance } = makeBrowser(oauthUrl, '{"access_token":"fixture"}');
        const request = oauthRequest();
        const native = vi.fn(async (outgoing: Request) => {
            expect(outgoing.redirect).toBe('manual');
            expect(new TextDecoder().decode(await outgoing.arrayBuffer())).toBe(form);
            return new Response('denied', { status: 403 });
        });

        expect((await fetchWithPlaywrightRetry(request, native)).status).toBe(200);

        const replay = session.send.mock.calls.find(([method]) => method === 'Fetch.continueRequest')![1];
        expect(replay.method).toBe('POST');
        expect(Buffer.from(replay.postData, 'base64').toString()).toBe(form);
        expect(replay.headers).toEqual(Array.from(request.headers, ([name, value]) => ({ name, value })));
        expect(native).toHaveBeenCalledTimes(1);
        expect(instance.destroy).toHaveBeenCalledTimes(1);
    });

    it('does not replay a large form even without a Content-Length header', async () => {
        const request = oauthRequest('refresh_token=' + 'x'.repeat(20 * 1024));
        const response = new Response('denied', { status: 403 });
        const native = vi.fn(async (outgoing: Request) => {
            await outgoing.arrayBuffer();
            return response;
        });

        expect(await fetchWithPlaywrightRetry(request, native)).toBe(response);
        expect(getPage).not.toHaveBeenCalled();
    });

    it.each<Record<string, string>>([{ 'content-type': 'application/json' }, { 'content-type': 'application/x-www-form-urlencoded', 'content-length': '20000' }])(
        'does not replay an ineligible OAuth request body: %o',
        async (headers) => {
            const request = new Request(oauthUrl, { method: 'POST', body: form, headers });
            const response = new Response('denied', { status: 403 });
            const native = vi.fn(() => Promise.resolve(response));
            expect(await fetchWithPlaywrightRetry(request, native)).toBe(response);
            expect(getPage).not.toHaveBeenCalled();
        }
    );

    it('blocks redirects, scripts, frames and subsequent documents without forwarding POST credentials', async () => {
        const { page, emit, session, instance } = makeBrowser(oauthUrl);
        page.goto.mockImplementation(() => {
            emit();
            emit({ requestId: 'script', resourceType: 'Script' });
            emit({ requestId: 'frame', frameId: 'child-frame' });
            emit({ requestId: 'another-document' });
            emit({ requestId: 'redirect', redirectedRequestId: 'original', request: { url: 'https://other.test/collect' } });
            return Promise.reject(new Error('Navigation blocked: refresh-fixture endpoint-fixture'));
        });
        const response = new Response('original denial', { status: 403 });
        const result = await fetchWithPlaywrightRetry(oauthRequest(), () => Promise.resolve(response));

        expect(result).toBe(response);
        expect(await result.text()).toBe('original denial');
        expect(session.send.mock.calls.filter(([method]) => method === 'Fetch.continueRequest')).toHaveLength(1);
        expect(session.send.mock.calls.filter(([method]) => method === 'Fetch.failRequest').map(([, params]) => params.requestId)).toEqual(['script', 'frame', 'another-document', 'redirect']);
        expect(instance.destroy).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(warn.mock.calls)).not.toMatch(/refresh-fixture|endpoint-fixture|other\.test/);
    });

    it('returns a repeated browser denial without another replay', async () => {
        const { instance } = makeBrowser(rankingUrl, 'browser denial', 403);
        const native = vi.fn(() => Promise.resolve(new Response('original denial', { status: 403 })));

        const response = await fetchWithPlaywrightRetry(new Request(rankingUrl), native);

        expect(response.status).toBe(403);
        expect(await response.text()).toBe('browser denial');
        expect(native).toHaveBeenCalledTimes(1);
        expect(getPage).toHaveBeenCalledTimes(1);
        expect(instance.destroy).toHaveBeenCalledTimes(1);
    });

    it('preserves native network errors without opening a browser', async () => {
        const failure = new Error('native connection failed');
        await expect(fetchWithPlaywrightRetry(new Request(biliUrl), () => Promise.reject(failure))).rejects.toBe(failure);
        expect(getPage).not.toHaveBeenCalled();
    });

    it('keeps the original response when browser setup fails without logging endpoint details', async () => {
        getPage.mockRejectedValue(new Error('wss://browser.test/playwright?token=endpoint-fixture'));
        const response = new Response('original denial', { status: 412 });

        expect(await fetchWithPlaywrightRetry(new Request(biliUrl), () => Promise.resolve(response))).toBe(response);
        expect(await response.text()).toBe('original denial');
        expect(JSON.stringify(warn.mock.calls)).not.toContain('endpoint-fixture');
    });

    it.each([false, true])('propagates cancellation during navigation and awaits cleanup (detached clone signal: %s)', async (detachedCloneSignal) => {
        const { page, emit, instance } = makeBrowser(biliUrl);
        page.goto.mockImplementation(() => {
            emit();
            return new Promise(() => {});
        });
        const controller = new AbortController();
        const request = new Request(biliUrl, { signal: controller.signal });
        if (detachedCloneSignal) {
            // Reproduce the clone losing signal propagation after its internal controller is collected.
            vi.spyOn(request, 'clone').mockImplementation(() => new Request(biliUrl));
        }
        const result = fetchWithPlaywrightRetry(request, () => Promise.resolve(new Response('denied', { status: 412 })));
        const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
        await vi.waitFor(() => expect(page.goto).toHaveBeenCalled());
        controller.abort();

        await assertion;
        expect(instance.destroy).toHaveBeenCalledTimes(1);
        expect(warn).not.toHaveBeenCalled();
    });

    it('cleans up a browser that finishes opening after cancellation', async () => {
        const { instance } = makeBrowser(biliUrl);
        const opening = Promise.withResolvers<typeof instance>();
        getPage.mockReturnValue(opening.promise);
        const controller = new AbortController();
        const result = fetchWithPlaywrightRetry(new Request(biliUrl, { signal: controller.signal }), () => Promise.resolve(new Response('denied', { status: 412 })));
        const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
        await vi.waitFor(() => expect(getPage).toHaveBeenCalled());
        controller.abort();
        await assertion;
        opening.resolve(instance);
        await vi.waitFor(() => expect(instance.destroy).toHaveBeenCalledTimes(1));
    });

    it('bounds a stalled browser response body and closes the browser', async () => {
        vi.useFakeTimers();
        const { response: browserResponse, instance } = makeBrowser(biliUrl);
        browserResponse.body.mockImplementation(() => new Promise(() => {}));
        const original = new Response('native denial', { status: 412 });
        const result = fetchWithPlaywrightRetry(new Request(biliUrl), () => Promise.resolve(original));
        await vi.waitFor(() => expect(browserResponse.body).toHaveBeenCalled());
        await vi.advanceTimersByTimeAsync(30000);

        expect(await result).toBe(original);
        expect(await original.text()).toBe('native denial');
        expect(instance.destroy).toHaveBeenCalledTimes(1);
    });
});
