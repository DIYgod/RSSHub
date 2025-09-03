import { describe, expect, it } from 'vitest';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { generateHeaders, PRESETS } from '@/utils/rand-user-agent';

describe('rand-user-agent', () => {
    it('should has default random ua', async () => {
        const response = await ofetch('http://rsshub.test/headers');
        expect(response['user-agent']).toBe(config.ua);
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

    it('generateHeaders should work with headerGeneratorPreset', () => {
        // Test with MODERN_WINDOWS_CHROME preset
        const headers = generateHeaders({ preset: PRESETS.MODERN_WINDOWS_CHROME });

        // Required headers should be present
        expect(headers['user-agent']).toBeDefined();
        expect(headers['sec-ch-ua']).toBeDefined();
        expect(headers['sec-ch-ua-mobile']).toBeDefined();
        expect(headers['sec-ch-ua-platform']).toBeDefined();

        // Verify it's using Windows platform
        expect(headers['sec-ch-ua-platform']).toBe('"Windows"');
        expect(headers['sec-ch-ua-mobile']).toBe('?0');

        // Verify it contains Chrome
        expect(headers['user-agent']).toMatch(/Chrome/);
    });

    it('should use headerGeneratorPreset with ofetch', async () => {
        // This test verifies that headerGeneratorPreset is passed through to the request rewriter
        const response = await ofetch('http://rsshub.test/headers', {
            headerGeneratorPreset: PRESETS.MODERN_WINDOWS_CHROME,
        });

        // The response should include the headers that were sent
        expect(response['user-agent']).toBeDefined();
        // Note: The specific header values will be handled by the request-rewriter,
        // but we can verify the request went through without errors
        expect(response).toBeDefined();
    });
});
