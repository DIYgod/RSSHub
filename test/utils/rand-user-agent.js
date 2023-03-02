const got = require('@/utils/got');
const config = require('@/config').value;
const nock = require('nock');
const randUserAgent = require('@/utils/rand-user-agent');
const mobileUa = require('@/utils/rand-user-agent')({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

describe('rand-user-agent', () => {
    it('chrome should not include headlesschrome', () => {
        const uaArr = Array(100)
            .fill()
            .map(() => randUserAgent({ browser: 'chrome', os: 'windows' }));
        const match = uaArr.find((e) => (e.includes('Chrome-Lighthouse') || e.includes('HeadlessChrome') ? true : false));
        expect(match).toBeFalsy();
    });

    it('should has default random ua', async () => {
        nock('https://rsshub.test')
            .get('/test')
            .reply(function () {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                expect(this.req.headers['user-agent']).not.toBe(mobileUa);
                expect(this.req.headers['user-agent']).not.toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');
                return [200, ''];
            });
        await got('https://rsshub.test/test');
    });

    it('should match ua configurated', async () => {
        const response1 = await got('https://www.whatsmyua.info/api/v1/ua');
        expect(response1.data[0].ua.rawUa).toBe(config.ua);

        const response2 = await got('https://www.whatsmyua.info/api/v1/ua', {
            headers: {
                'user-agent': mobileUa,
            },
        });
        expect(response2.data[0].ua.rawUa).toBe(mobileUa);
        expect(response2.data[0].ua.rawUa).not.toBe(config.ua);
    });
});
