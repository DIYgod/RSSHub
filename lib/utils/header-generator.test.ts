import { describe, expect, it } from 'vitest';

import { generateHeaders, PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';

describe('header-generator', () => {
    it('should has no ua', async () => {
        const response = await ofetch('http://rsshub.test/headers');
        expect(response['user-agent']).toBeUndefined();
    });

    it('should match ua configurated', async () => {
        const testUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
        const response = await ofetch('http://rsshub.test/headers', {
            headers: {
                'user-agent': testUa,
            },
        });
        expect(response['user-agent']).toBe(testUa);
    });

    it('generateHeaders should include sec-ch and sec-fetch headers', () => {
        const headers = generateHeaders(PRESETS.MODERN_MACOS_CHROME);

        expect(headers['user-agent']).toBeDefined();
        expect(headers['sec-ch-ua']).toBeDefined();
        expect(headers['sec-ch-ua-mobile']).toBeDefined();
        expect(headers['sec-ch-ua-platform']).toBeDefined();
        expect(headers['sec-fetch-site']).toBeDefined();
        expect(headers['sec-fetch-mode']).toBeDefined();
        expect(headers['sec-fetch-user']).toBeDefined();
        expect(headers['sec-fetch-dest']).toBeDefined();

        expect(headers['sec-ch-ua-platform']).toBe('"macOS"');
        expect(headers['sec-ch-ua-mobile']).toBe('?0');
    });

    it('generateHeaders should work with headerGeneratorOptions', () => {
        const headers = generateHeaders(PRESETS.MODERN_WINDOWS_CHROME);

        expect(headers['user-agent']).toBeDefined();
        expect(headers['sec-ch-ua']).toBeDefined();
        expect(headers['sec-ch-ua-mobile']).toBeDefined();
        expect(headers['sec-ch-ua-platform']).toBeDefined();

        // Platform may vary due to header-generator randomness, just check it's a quoted string
        expect(headers['sec-ch-ua-platform']).toMatch(/^".*"$/);
        expect(headers['sec-ch-ua-mobile']).toBe('?0');
        expect(headers['user-agent']).toMatch(/Chrome/);
    });

    it('generateHeaders should use default preset when no preset is provided', () => {
        const headers = generateHeaders();

        expect(headers['user-agent']).toBeDefined();
        expect(headers['sec-ch-ua']).toBeDefined();
        expect(headers['sec-ch-ua-mobile']).toBeDefined();
        expect(headers['sec-ch-ua-platform']).toBeDefined();

        expect(headers['sec-ch-ua-platform']).toBe('"macOS"');
        expect(headers['sec-ch-ua-mobile']).toBe('?0');
        expect(headers['user-agent']).toMatch(/Chrome/);
    });
});
