import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/api';

const mockHas = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());

vi.mock('@/utils/cache/index', () => ({
    default: {
        status: { available: true },
        globalCache: {
            has: mockHas,
            get: mockGet,
            set: vi.fn(),
        },
        tryGet: vi.fn(),
    },
}));

describe('GET /api/route/status', () => {
    beforeEach(() => {
        mockHas.mockReset();
        mockGet.mockReset();
    });

    it('returns 404 when cache is cold', async () => {
        mockHas.mockResolvedValue(false);

        const response = await api.request('/route/status?requestPath=/github/comments/DIYgod/RSSHub/20768');
        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.cached).toBe(false);
        expect(data.lastBuildDate).toBeNull();
    });

    it('returns cached: true with lastBuildDate when cache is warm', async () => {
        const mockBuildDate = 'Mon, 1 Jan 2026 10:00:00 GMT';
        mockHas.mockResolvedValue(true);
        mockGet.mockResolvedValue(
            JSON.stringify({
                lastBuildDate: mockBuildDate,
                items: [],
            })
        );

        const response = await api.request('/route/status?requestPath=/github/comments/DIYgod/RSSHub/20768');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.cached).toBe(true);
        expect(data.lastBuildDate).toBe(mockBuildDate);
    });

    it('returns 503 when cache is unavailable', async () => {
        const { default: cacheModule } = await import('@/utils/cache/index');
        (cacheModule.status as { available: boolean }).available = false;

        try {
            const response = await api.request('/route/status?requestPath=/github/comments/DIYgod/RSSHub/20768');
            expect(response.status).toBe(503);

            const data = await response.json();
            expect(data.cached).toBe(false);
        } finally {
            (cacheModule.status as { available: boolean }).available = true;
        }
    });
});
