import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    delete process.env.ALLOW_REQUEST_CONFIG;
    delete process.env.ACCESS_KEY;
    delete process.env.TWITTER_AUTH_TOKEN;
    delete process.env.ZHIHU_COOKIES;
    vi.resetModules();
});

const createApp = async () => {
    const { config } = await import('@/config');
    const { default: requestConfig } = await import('@/middleware/request-config');
    const { default: InvalidParameterError } = await import('@/errors/types/invalid-parameter');

    const app = new Hono();
    app.onError((error, ctx) => ctx.json({ error: error.message }, error instanceof InvalidParameterError ? 400 : 500));
    app.use(requestConfig);
    app.get('/seen', async (ctx) => {
        // a pause, so that concurrent requests would show whether they share state
        await new Promise((resolve) => {
            setTimeout(resolve, 10);
        });
        return ctx.json({ authToken: config.twitter.authToken ?? null, cookies: config.zhihu.cookies ?? null, proxyUri: config.proxyUri ?? null });
    });
    return { app, config };
};

const enable = () => {
    process.env.ALLOW_REQUEST_CONFIG = 'true';
    process.env.ACCESS_KEY = 'key';
};

const withHeader = (value: unknown) => ({ headers: { 'X-RSSHub-Config': typeof value === 'string' ? value : JSON.stringify(value) } });

describe('request-config', () => {
    it('does nothing without the header, even when enabled', async () => {
        enable();
        process.env.TWITTER_AUTH_TOKEN = 'instance';
        const { app } = await createApp();

        const response = await app.request('/seen');
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ authToken: ['instance'] });
    });

    it('overrides config values for the request only', async () => {
        enable();
        process.env.TWITTER_AUTH_TOKEN = 'instance';
        const { app, config } = await createApp();

        const response = await app.request('/seen', withHeader({ twitter: { authToken: 'mine' }, zhihu: { cookies: 'z=1' } }));
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ authToken: ['mine'], cookies: 'z=1' });

        expect(config.twitter.authToken).toEqual(['instance']);
        expect(config.zhihu.cookies).toBeUndefined();
    });

    it('works when the instance has no value of its own', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ twitter: { authToken: 'a, b' } }));
        expect(await response.json()).toMatchObject({ authToken: ['a', 'b'] });
    });

    it('accepts a list for list options', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ twitter: { authToken: ['a', 'b'] } }));
        expect(await response.json()).toMatchObject({ authToken: ['a', 'b'] });
    });

    it('keeps concurrent requests apart', async () => {
        enable();
        const { app } = await createApp();

        const responses = await Promise.all(['one', 'two', 'three'].map((token) => app.request('/seen', withHeader({ twitter: { authToken: token } }))));
        const bodies = await Promise.all(responses.map((response) => response.json()));
        expect(bodies.map((body) => body.authToken)).toEqual([['one'], ['two'], ['three']]);
    });

    it('does not let a handler change the instance config', async () => {
        enable();
        process.env.TWITTER_AUTH_TOKEN = 'instance';
        const { app, config } = await createApp();
        app.get('/mutate', (ctx) => {
            config.twitter.authToken = config.twitter.authToken?.filter((token) => token !== 'mine');
            return ctx.text('ok');
        });

        await app.request('/mutate', withHeader({ twitter: { authToken: 'mine' } }));
        expect(config.twitter.authToken).toEqual(['instance']);
    });

    it('is rejected unless enabled together with an access key', async () => {
        for (const env of [{}, { ALLOW_REQUEST_CONFIG: 'true' }, { ACCESS_KEY: 'key' }]) {
            Object.assign(process.env, env);
            // eslint-disable-next-line no-await-in-loop
            const { app } = await createApp();
            // eslint-disable-next-line no-await-in-loop
            const response = await app.request('/seen', withHeader({ twitter: { authToken: 'mine' } }));
            // eslint-disable-next-line no-await-in-loop
            expect(response.status).toBe(400);
            // eslint-disable-next-line no-await-in-loop
            expect(await response.json()).toMatchObject({ error: expect.stringMatching(/ALLOW_REQUEST_CONFIG=true together with ACCESS_KEY/) });
            delete process.env.ALLOW_REQUEST_CONFIG;
            delete process.env.ACCESS_KEY;
            vi.resetModules();
        }
    });

    it.each([
        ['not JSON', 'nope'],
        ['not an object', '["twitter"]'],
        ['an instance namespace', { proxy: { uri: 'http://evil' } }],
        ['a namespace that does not exist', { nothing: { token: 'x' } }],
        ['a namespace that is not an object', { proxyUri: 'http://evil' }],
        ['an inherited namespace', { constructor: { token: 'x' } }],
        ['a key that does not exist', { twitter: { nothing: 'x' } }],
        ['a key that is not a credential', { twitter: { thirdPartyApi: 'http://evil' } }],
        ['a value that is not a string', { zhihu: { cookies: 1 } }],
        ['an empty value', { zhihu: { cookies: '' } }],
        ['an empty list', { twitter: { authToken: [] } }],
    ])('rejects %s', async (_name, header) => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader(header));
        expect(response.status).toBe(400);
    });

    it('rejects a header that is too large', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ zhihu: { cookies: 'x'.repeat(9000) } }));
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: expect.stringMatching(/too large/) });
    });

    it('never echoes the values it rejects', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ twitter: { thirdPartyApi: 'secret-value' } }));
        expect(await response.text()).not.toContain('secret-value');
    });
});

describe('request-config in the app', () => {
    it('is applied after the access control', async () => {
        enable();
        const app = (await import('@/app')).default;

        const denied = await app.request('/test/1', withHeader({ twitter: { authToken: 'mine' } }));
        expect(denied.status).toBe(403);

        const rejected = await app.request('/test/1?key=key', withHeader({ twitter: { thirdPartyApi: 'http://evil' } }));
        // the error handler of the app answers every parameter error with 503
        expect(rejected.status).toBe(503);
        expect(await rejected.text()).toContain('X-RSSHub-Config: &quot;twitter.thirdPartyApi&quot; cannot be set per request.');

        const accepted = await app.request('/test/1?key=key', withHeader({ twitter: { authToken: 'mine' } }));
        expect(accepted.status).toBe(200);
    });
});
