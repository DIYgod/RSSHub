import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock('header-generator');
});

describe('header-generator (mocked)', () => {
    it('retries invalid safari user agents', async () => {
        const headersQueue = [{ 'user-agent': 'Mozilla/5.0 Applebot Safari' }, { 'user-agent': 'Mozilla/5.0 Safari' }];

        vi.doMock('header-generator', () => ({
            HeaderGenerator: class {
                getHeaders() {
                    return headersQueue.shift() ?? { 'user-agent': 'Mozilla/5.0 Safari' };
                }
            },
            PRESETS: {
                MODERN_MACOS_CHROME: { mock: true },
            },
        }));

        const { generateHeaders } = await import('@/utils/header-generator');
        const headers = generateHeaders({ preset: 'safari' } as any);

        expect(headers['user-agent']).toContain('Safari');
        expect(headersQueue.length).toBe(0);
    });

    it('accepts firefox user agents', async () => {
        const headersQueue = [{ 'user-agent': 'Mozilla/5.0 Firefox' }];

        vi.doMock('header-generator', () => ({
            HeaderGenerator: class {
                getHeaders() {
                    return headersQueue.shift() ?? { 'user-agent': 'Mozilla/5.0 Firefox' };
                }
            },
            PRESETS: {
                MODERN_MACOS_CHROME: { mock: true },
            },
        }));

        const { generateHeaders } = await import('@/utils/header-generator');
        const headers = generateHeaders();

        expect(headers['user-agent']).toContain('Firefox');
    });
});
