import { describe, expect, it } from 'vitest';
import got from '@/utils/got';
import { config } from '@/config';
import nock from 'nock';
import randUserAgent from '@/utils/rand-user-agent';

const mobileUa = randUserAgent({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

describe('rand-user-agent', () => {
    it('chrome should not include headlesschrome', () => {
        const uaArr = Array(100)
            .fill(null)
            .map(() => randUserAgent({ browser: 'chrome', os: 'windows' }));
        const match = uaArr.find((e) => !!(e.includes('Chrome-Lighthouse') || e.includes('HeadlessChrome')));
        expect(match).toBeFalsy();
    });
    it('chrome should not include electron', () => {
        const uaArr = Array(100)
            .fill(null)
            .map(() => randUserAgent({ browser: 'chrome', os: 'windows' }));
        const match = uaArr.find((e) => !!e.includes('Electron'));
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
        nock('https://rsshub.test')
            .get('/test')
            .reply(function () {
                return [200, { ua: this.req.headers['user-agent'] }];
            });

        const resonse = await got('https://rsshub.test/test', {
            headers: {
                'user-agent': mobileUa,
            },
        });
        // @ts-expect-error custom field
        expect(resonse.data.ua).toBe(mobileUa);
    });
});
