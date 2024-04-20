import { describe, expect, it } from 'vitest';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
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
        const response = await ofetch('http://rsshub.test/headers');
        expect(response['user-agent']).toBe(config.ua);
    });

    it('should match ua configurated', async () => {
        const response = await ofetch('http://rsshub.test/headers', {
            headers: {
                'user-agent': mobileUa,
            },
        });
        expect(response['user-agent']).toBe(mobileUa);
    });
});
