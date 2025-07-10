import { describe, expect, it, afterEach, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
});

describe('config', () => {
    it('bilibilib cookie', async () => {
        process.env.BILIBILI_COOKIE_12 = 'cookie1';
        process.env.BILIBILI_COOKIE_34 = 'cookie2';

        const { config } = await import('./config');
        expect(config.bilibili.cookies).toMatchObject({
            12: 'cookie1',
            34: 'cookie2',
        });

        delete process.env.BILIBILI_COOKIE_12;
        delete process.env.BILIBILI_COOKIE_34;
    });

    it('email config', async () => {
        process.env['EMAIL_CONFIG_xx.qq.com'] = 'token1';
        process.env['EMAIL_CONFIG_oo.qq.com'] = 'token2';

        const { config } = await import('./config');
        expect(config.email.config).toMatchObject({
            'xx.qq.com': 'token1',
            'oo.qq.com': 'token2',
        });

        delete process.env['EMAIL_CONFIG_xx.qq.com'];
        delete process.env['EMAIL_CONFIG_oo.qq.com'];
    });

    it('discuz cookie', async () => {
        process.env.DISCUZ_COOKIE_12 = 'cookie1';
        process.env.DISCUZ_COOKIE_34 = 'cookie2';

        const { config } = await import('./config');
        expect(config.discuz.cookies).toMatchObject({
            12: 'cookie1',
            34: 'cookie2',
        });

        delete process.env.DISCUZ_COOKIE_12;
        delete process.env.DISCUZ_COOKIE_34;
    });

    it('medium cookie', async () => {
        process.env.MEDIUM_COOKIE_12 = 'cookie1';
        process.env.MEDIUM_COOKIE_34 = 'cookie2';

        const { config } = await import('./config');
        expect(config.medium.cookies).toMatchObject({
            12: 'cookie1',
            34: 'cookie2',
        });

        delete process.env.MEDIUM_COOKIE_12;
        delete process.env.MEDIUM_COOKIE_34;
    });

    it('discourse config', async () => {
        process.env.DISCOURSE_CONFIG_12 = JSON.stringify({ a: 1 });
        process.env.DISCOURSE_CONFIG_34 = JSON.stringify({ b: 2 });

        const { config } = await import('./config');
        expect(config.discourse.config).toMatchObject({
            12: { a: 1 },
            34: { b: 2 },
        });

        delete process.env.DISCOURSE_CONFIG_12;
        delete process.env.DISCOURSE_CONFIG_34;
    });

    it('no random ua', async () => {
        process.env.NO_RANDOM_UA = '1';

        const { config } = await import('./config');
        expect(config.ua).toBe('RSSHub/1.0 (+http://github.com/DIYgod/RSSHub; like FeedFetcher-Google)');

        delete process.env.NO_RANDOM_UA;
    });

    it('random ua', async () => {
        const { config } = await import('./config');
        expect(config.ua).not.toBe('RSSHub/1.0 (+http://github.com/DIYgod/RSSHub; like FeedFetcher-Google)');
    });

    it('remote config', async () => {
        process.env.REMOTE_CONFIG = 'http://rsshub.test/config';

        const { config } = await import('./config');
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(config.ua).toBe('test');
    });
});
