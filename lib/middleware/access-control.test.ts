import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { md5 } from '@/utils/hash';
import type { WeiboOAuthState } from '@/utils/weibo-oauth';

process.env.NODE_NAME = 'mock';

// MTProto cannot be reached in tests: stand in for the Telegram client with one channel holding one photo post
vi.mock('@/routes/telegram/tglib/client', async (importOriginal) => {
    const { Api } = await import('teleproto');
    const { returnBigInt } = await import('teleproto/Helpers.js');
    const channel = new Api.Channel({ id: returnBigInt(1), title: 'Some channel', photo: new Api.ChatPhotoEmpty(), date: 1_767_225_600 });
    const photoPost = {
        id: 42,
        message: 'hello',
        text: 'hello',
        entities: [],
        date: 1_767_225_600,
        peerId: new Api.PeerChannel({ channelId: channel.id }),
        media: new Api.MessageMediaPhoto({ photo: new Api.PhotoEmpty({ id: returnBigInt(7) }) }),
    };
    return {
        ...(await importOriginal<object>()),
        getClient: () => ({
            getInputEntity: () => new Api.InputPeerChannel({ channelId: channel.id, accessHash: returnBigInt(2) }),
            getEntity: () => channel,
            getMessages: () => [photoPost],
        }),
    };
});

async function checkBlock(response) {
    expect(response.status).toBe(403);
    expect(await response.text()).toMatch(/Access denied\./);
}

afterEach(() => {
    delete process.env.ACCESS_KEY;
    delete process.env.TELEGRAM_SESSION;
    vi.resetModules();
});

describe('access-control', () => {
    it('access key', async () => {
        const key = '1L0veRSSHub';
        const code = md5('/test/2' + key);
        process.env.ACCESS_KEY = key;
        const app = (await import('@/app')).default;

        const response01 = await app.request('/');
        expect(response01.status).toBe(200);

        const response02 = await app.request('/robots.txt');
        expect(response02.status).toBe(404);

        // no key/code
        const response21 = await app.request('/test/2');
        await checkBlock(response21);

        // wrong key/code
        const response321 = await app.request(`/test/2?key=wrong+${key}`);
        await checkBlock(response321);

        const response322 = await app.request(`/test/2?code=wrong+${code}`);
        await checkBlock(response322);

        // right key/code
        const response331 = await app.request(`/test/2?key=${key}`);
        expect(response331.status).toBe(200);

        const response332 = await app.request(`/test/2?code=${code}`);
        expect(response332.status).toBe(200);
    });

    it('telegram media links carry the access code of their own path, not the requester credential', async () => {
        const key = '1L0veRSSHub';
        const channelPath = '/telegram/channel/some_channel';
        const mediaPath = '/telegram/media/some_channel/42';
        process.env.ACCESS_KEY = key;
        process.env.TELEGRAM_SESSION = 'unused';
        const app = (await import('@/app')).default;

        // the key holder fills the route cache, the code holder reads the cached feed
        const ownerFeed = await (await app.request(`${channelPath}?key=${key}&format=json`)).text();
        const guestResponse = await app.request(`${channelPath}?code=${md5(channelPath + key)}&format=json`);
        expect(guestResponse.status).toBe(200);
        const guestFeed = await guestResponse.text();

        for (const feed of [ownerFeed, guestFeed]) {
            expect(feed).not.toContain(`key=${key}`);
            expect(feed).not.toContain(`code=${md5(channelPath + key)}`);
            expect(feed).toContain(`${mediaPath}?code=${md5(mediaPath + key)}`);
        }
        expect((await app.request(`${mediaPath}?code=${md5(mediaPath + key)}`)).status).not.toBe(403);
    });
});

const setupProtectedWeiboOAuth = async () => {
    process.env.ACCESS_KEY = 'fake-test-key';
    const { config } = await import('@/config');
    const cache = (await import('@/utils/cache')).default;
    const { default: accessControl } = await import('@/middleware/access-control');
    const { createWeiboOAuthState } = await import('@/utils/weibo-oauth');
    const app = new Hono<{ Variables: { weiboOAuthState: WeiboOAuthState } }>();
    app.onError((error, ctx) => ctx.text(error.message, error.name === 'RejectError' ? 403 : 500));
    app.use('*', accessControl);
    app.get('/authorize', async (ctx) => ctx.text(await createWeiboOAuthState(ctx, '2', 'displayVideo=1')));
    app.get('/weibo/timeline/0', (ctx) => {
        const state = ctx.get('weiboOAuthState');
        return state ? ctx.json(state) : ctx.text('initial authorization');
    });
    return { app, cache, config };
};

describe('protected Weibo OAuth', () => {
    it('rejects anonymous authorization and unknown callback states', async () => {
        const { app } = await setupProtectedWeiboOAuth();
        expect((await app.request('/authorize')).status).toBe(403);
        expect((await app.request('/weibo/timeline/0?code=fake-oauth-code&state=not-a-state')).status).toBe(403);
    });

    it('allows a valid access signature to initiate authorization on the callback path', async () => {
        const { app, config } = await setupProtectedWeiboOAuth();
        const response = await app.request(`/weibo/timeline/0?code=${md5('/weibo/timeline/0' + config.accessKey)}`);
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('initial authorization');
    });

    it('consumes callback state once, including concurrent callbacks', async () => {
        const { app } = await setupProtectedWeiboOAuth();
        const authorization = await app.request('/authorize?key=fake-test-key');
        expect(authorization.status).toBe(200);
        const state = await authorization.text();
        expect(state).not.toContain('fake-test-key');
        const responses = await Promise.all([app.request(`/weibo/timeline/0?code=fake-oauth-code&state=${state}`), app.request(`/weibo/timeline/0?code=fake-oauth-code&state=${state}`)]);
        expect(responses.map((response) => response.status).toSorted((left, right) => left - right)).toEqual([200, 403]);
        const response = responses.find((response) => response.status === 200)!;
        expect(await response.json()).toMatchObject({ feature: '2', routeParams: 'displayVideo=1' });
        expect((await app.request(`/weibo/timeline/0?code=fake-oauth-code&state=${state}`)).status).toBe(403);
    });

    it('rejects expired states and states issued before access-key rotation', async () => {
        const { app, cache, config } = await setupProtectedWeiboOAuth();
        const expiredState = await (await app.request('/authorize?key=fake-test-key')).text();
        const key = `weibo:oauth:state:${expiredState}`;
        const stored = JSON.parse((await cache.globalCache.get(key))!);
        await cache.globalCache.set(key, { ...stored, expiresAt: Temporal.Now.instant().epochMilliseconds - 1 }, 600);
        expect((await app.request(`/weibo/timeline/0?code=fake-oauth-code&state=${expiredState}`)).status).toBe(403);
        const previousState = await (await app.request('/authorize?key=fake-test-key')).text();
        config.accessKey = 'rotated-fake-test-key';
        expect((await app.request(`/weibo/timeline/0?code=fake-oauth-code&state=${previousState}`)).status).toBe(403);
    });

    it('fails closed when the cache cannot guarantee atomic claims', async () => {
        const { app, cache } = await setupProtectedWeiboOAuth();
        cache.globalCache.supportsAtomicClaims = false;
        const response = await app.request('/authorize?key=fake-test-key');
        expect(response.status).toBe(500);
        expect(await response.text()).toContain('memory or Redis cache');
        expect((await app.request('/weibo/timeline/0?code=fake-oauth-code&state=00000000-0000-0000-0000-000000000000')).status).toBe(403);
    });
});
