import { once } from 'node:events';
import { createServer } from 'node:http';

import { youtube as googleYoutube } from '@googleapis/youtube';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const runtime = vi.hoisted(() => ({ isWorker: true }));

vi.mock('../lib/config', () => ({
    config: {
        youtube: {
            key: 'test-api-key',
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            refreshToken: 'test-refresh-token',
        },
        cache: { routeExpire: 300 },
    },
}));
vi.mock('../lib/utils/is-worker', () => ({
    get isWorker() {
        return runtime.isWorker;
    },
}));
vi.mock('../lib/utils/cache', () => ({
    default: {
        tryGet: vi.fn((_key, getValue) => getValue()),
        get: vi.fn(),
        set: vi.fn(),
    },
}));
vi.mock('../lib/utils/ofetch', () => ({ default: vi.fn() }));

const nativeFetch = vi.fn<typeof fetch>();
const fallbackRequest = vi.fn();
const localServer = createServer((request, response) => {
    fallbackRequest(request.url);
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ items: [{ id: 'fallback-result' }] }));
});
let rootUrl: string;

beforeAll(async () => {
    localServer.listen(0, '127.0.0.1');
    await once(localServer, 'listening');
    const address = localServer.address();
    if (!address || typeof address === 'string') {
        throw new Error('The local API server did not open a TCP port');
    }
    rootUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
    localServer.close();
    await once(localServer, 'close');
});

beforeEach(() => {
    vi.resetModules();
    runtime.isWorker = true;
    nativeFetch.mockReset();
    fallbackRequest.mockClear();
    for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']) {
        vi.stubEnv(key, '');
    }
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('YouTube Google transport', () => {
    it.each(['channels', 'playlistItems', 'videos'])('uses the current Worker fetch and parses %s responses as JSON', async (resource) => {
        const { exec } = await import('../lib/routes/youtube/api/google');
        nativeFetch.mockResolvedValue(Response.json({ items: [{ id: 'native-result' }] }));
        vi.stubGlobal('fetch', nativeFetch);

        const response = await exec((client) => client[resource].list({ part: 'snippet', id: 'test-id' }, { rootUrl, retry: false }));

        expect(response.data.items[0].id).toBe('native-result');
        expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(expect.any(URL), expect.objectContaining({ method: 'GET' }));
        const url = new URL(nativeFetch.mock.calls[0][0].toString());
        expect(url.pathname).toBe(`/youtube/v3/${resource}`);
        expect(url.searchParams.get('key')).toBe('test-api-key');
        expect(fallbackRequest).not.toHaveBeenCalled();
    });

    it('uses Worker fetch for OAuth refresh and authenticated subscription requests', async () => {
        const { youtubeOAuth2Client } = await import('../lib/routes/youtube/api/google');
        Object.assign(youtubeOAuth2Client.endpoints, { oauth2TokenUrl: `${rootUrl}/token` });
        nativeFetch.mockResolvedValueOnce(Response.json({ access_token: 'test-access-token', expires_in: 3600, token_type: 'Bearer' })).mockResolvedValueOnce(Response.json({ items: [{ id: 'test-subscription' }] }));
        vi.stubGlobal('fetch', nativeFetch);

        expect((await youtubeOAuth2Client.getAccessToken()).token).toBe('test-access-token');
        const response = await googleYoutube('v3').subscriptions.list({ auth: youtubeOAuth2Client, part: ['snippet'], mine: true }, { rootUrl, retry: false });
        expect(response.data.items).toEqual([{ id: 'test-subscription' }]);

        expect(nativeFetch).toHaveBeenCalledTimes(2);
        const [[tokenUrl, tokenOptions], [subscriptionsUrl, subscriptionsOptions]] = nativeFetch.mock.calls;
        expect(new URL(tokenUrl.toString()).pathname).toBe('/token');
        expect(tokenOptions?.method).toBe('POST');
        expect(new URLSearchParams(tokenOptions?.body?.toString()).get('refresh_token')).toBe('test-refresh-token');
        expect(new URL(subscriptionsUrl.toString()).pathname).toBe('/youtube/v3/subscriptions');
        expect(new Headers(subscriptionsOptions?.headers).get('authorization')).toBe('Bearer test-access-token');
        expect(fallbackRequest).not.toHaveBeenCalled();
    });

    it('keeps the SDK default transport in Node', async () => {
        runtime.isWorker = false;
        const { exec } = await import('../lib/routes/youtube/api/google');
        nativeFetch.mockRejectedValue(new Error('Unexpected global fetch in Node'));
        vi.stubGlobal('fetch', nativeFetch);

        const response = await exec((client) => client.channels.list({ part: 'snippet', id: 'test-id' }, { rootUrl, retry: false }));

        expect(response.status).toBe(200);
        expect(response.data.items).toEqual([{ id: 'fallback-result' }]);
        expect(fallbackRequest).toHaveBeenCalledOnce();
        expect(new URL(fallbackRequest.mock.calls[0][0], rootUrl).pathname).toBe('/youtube/v3/channels');
        expect(nativeFetch).not.toHaveBeenCalled();
    });
});
