afterEach(() => {
    jest.resetModules();
});

describe('config', () => {
    it('bilibilib cookie', async () => {
        process.env.BILIBILI_COOKIE_12 = 'cookie1';
        process.env.BILIBILI_COOKIE_34 = 'cookie2';

        const config = require('../lib/config');
        expect(config.bilibili.cookies).toMatchObject({
            12: 'cookie1',
            34: 'cookie2',
        });

        delete process.env.BILIBILI_COOKIE_12;
        delete process.env.BILIBILI_COOKIE_34;
    });

    it('twitter token', async () => {
        process.env.TWITTER_TOKEN_12 = 'token1';
        process.env.TWITTER_TOKEN_34 = 'token2';

        const config = require('../lib/config');
        expect(config.twitter.tokens).toMatchObject({
            12: 'token1',
            34: 'token2',
        });

        delete process.env.TWITTER_TOKEN_12;
        delete process.env.TWITTER_TOKEN_34;
    });
});
