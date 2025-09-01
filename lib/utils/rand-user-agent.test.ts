import { describe, expect, it } from 'vitest';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import randUserAgent, { generateHeaders } from '@/utils/rand-user-agent';

const mobileUa = randUserAgent({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

describe('rand-user-agent', () => {
    it('chrome should not include headlesschrome', () => {
        const uaArr = Array.from({ length: 100 })
            .fill(null)
            .map(() => randUserAgent({ browser: 'chrome', os: 'windows' }));
        const match = uaArr.find((e) => !!(e.includes('Chrome-Lighthouse') || e.includes('HeadlessChrome')));
        expect(match).toBeFalsy();
    });
    it('chrome should not include electron', () => {
        const uaArr = Array.from({ length: 100 })
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

    it('generateHeaders should include sec-ch and sec-fetch headers', () => {
        const headers = generateHeaders({ browser: 'chrome', os: 'mac os', device: 'desktop' });

        // Required headers should be present
        expect(headers['user-agent']).toBeDefined();
        expect(headers['sec-ch-ua']).toBeDefined();
        expect(headers['sec-ch-ua-mobile']).toBeDefined();
        expect(headers['sec-ch-ua-platform']).toBeDefined();
        expect(headers['sec-fetch-site']).toBeDefined();
        expect(headers['sec-fetch-mode']).toBeDefined();
        expect(headers['sec-fetch-user']).toBeDefined();
        expect(headers['sec-fetch-dest']).toBeDefined();

        // Verify expected values
        expect(headers['sec-ch-ua-platform']).toBe('"macOS"');
        expect(headers['sec-ch-ua-mobile']).toBe('?0');
    });
});
