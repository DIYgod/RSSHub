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

    it('overrides environment variables for the request only', async () => {
        enable();
        process.env.TWITTER_AUTH_TOKEN = 'instance';
        const { app, config } = await createApp();

        const response = await app.request('/seen', withHeader({ TWITTER_AUTH_TOKEN: 'mine', ZHIHU_COOKIES: 'z=1' }));
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ authToken: ['mine'], cookies: 'z=1' });

        expect(config.twitter.authToken).toEqual(['instance']);
        expect(config.zhihu.cookies).toBeUndefined();
    });

    it('accepts per-account cookie variables', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ BILIBILI_COOKIE_1: 'a=1' }));
        expect(response.status).toBe(200);
    });

    it('parses values like the environment variable does', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ TWITTER_AUTH_TOKEN: 'a,b' }));
        expect(await response.json()).toMatchObject({ authToken: ['a', 'b'] });
    });

    it('keeps concurrent requests apart', async () => {
        enable();
        const { app } = await createApp();

        const responses = await Promise.all(['one', 'two', 'three'].map((token) => app.request('/seen', withHeader({ TWITTER_AUTH_TOKEN: token }))));
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

        await app.request('/mutate', withHeader({ TWITTER_AUTH_TOKEN: 'mine' }));
        expect(config.twitter.authToken).toEqual(['instance']);
    });

    it.each([{}, { ALLOW_REQUEST_CONFIG: 'true' }, { ACCESS_KEY: 'key' }])('is rejected unless enabled together with an access key: %j', async (env) => {
        Object.assign(process.env, env);
        const { app } = await createApp();
        const response = await app.request('/seen', withHeader({ TWITTER_AUTH_TOKEN: 'mine' }));
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: expect.stringMatching(/ALLOW_REQUEST_CONFIG=true together with ACCESS_KEY/) });
    });

    it.each([
        ['not JSON', 'nope'],
        ['not an object', '["TWITTER_AUTH_TOKEN"]'],
        ['an instance variable', { PROXY_AUTH: 'x' }],
        ['the access key', { ACCESS_KEY: 'x' }],
        ['a host that only starts like a credential', { MISSKEY_API_HOST: 'evil.example' }],
        ['a variable that is not a credential', { TWITTER_THIRD_PARTY_API: 'http://evil' }],
        ['a name that is not an environment variable', { twitter: 'x' }],
        ['a value that is not a string', { ZHIHU_COOKIES: 1 }],
        ['an empty value', { ZHIHU_COOKIES: '' }],
    ])('rejects %s', async (_name, header) => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader(header));
        expect(response.status).toBe(400);
    });

    it('rejects a header that is too large', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ ZHIHU_COOKIES: 'x'.repeat(9000) }));
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: expect.stringMatching(/too large/) });
    });

    it('never echoes the values it rejects', async () => {
        enable();
        const { app } = await createApp();

        const response = await app.request('/seen', withHeader({ TWITTER_THIRD_PARTY_API: 'secret-value' }));
        expect(await response.text()).not.toContain('secret-value');
    });
});

describe('request-config in the app', () => {
    it('is applied after the access control', async () => {
        enable();
        const app = (await import('@/app')).default;

        const denied = await app.request('/test/1', withHeader({ TWITTER_AUTH_TOKEN: 'mine' }));
        expect(denied.status).toBe(403);

        const rejected = await app.request('/test/1?key=key', withHeader({ TWITTER_THIRD_PARTY_API: 'http://evil' }));
        expect(rejected.status).toBe(503);
        expect(await rejected.text()).toContain('X-RSSHub-Config: &quot;TWITTER_THIRD_PARTY_API&quot; cannot be set per request.');

        const accepted = await app.request('/test/1?key=key', withHeader({ TWITTER_AUTH_TOKEN: 'mine' }));
        expect(accepted.status).toBe(200);
    });
});
