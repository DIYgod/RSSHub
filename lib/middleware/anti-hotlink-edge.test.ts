import { describe, expect, it, vi } from 'vitest';

import { config } from '@/config';

const errorSpy = vi.fn();

vi.mock('@/utils/logger', () => ({
    default: {
        error: errorSpy,
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

const createCtx = (query: Record<string, string | undefined>, data: any) => {
    const store = new Map<string, unknown>([['data', data]]);
    return {
        req: {
            path: '/test/path',
            query: (key: string) => query[key],
        },
        get: (key: string) => store.get(key),
        set: (key: string, value: unknown) => store.set(key, value),
    };
};

describe('anti-hotlink edge cases', () => {
    it('logs parse errors and keeps invalid urls', async () => {
        const originalAllow = config.feature.allow_user_hotlink_template;
        config.feature.allow_user_hotlink_template = true;

        const { default: antiHotlink } = await import('@/middleware/anti-hotlink');
        const data = {
            image: 'http://invalid url',
        };
        const ctx = createCtx({ image_hotlink_template: 'https://img.test/${href}' }, data);

        await antiHotlink(ctx as any, async () => {});

        expect(data.image).toBe('http://invalid url');
        expect(errorSpy).toHaveBeenCalled();

        config.feature.allow_user_hotlink_template = originalAllow;
    });

    it('returns original url when template is missing', async () => {
        const originalAllow = config.feature.allow_user_hotlink_template;
        config.feature.allow_user_hotlink_template = true;

        const { default: antiHotlink } = await import('@/middleware/anti-hotlink');
        const data = {
            image: 'https://example.com/img.jpg',
        };
        const ctx = createCtx({ multimedia_hotlink_template: 'https://media.test/${href}' }, data);

        await antiHotlink(ctx as any, async () => {});

        expect(data.image).toBe('https://example.com/img.jpg');

        config.feature.allow_user_hotlink_template = originalAllow;
    });
});
