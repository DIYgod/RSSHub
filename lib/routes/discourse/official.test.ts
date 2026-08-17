import { beforeEach, describe, expect, it, vi } from 'vitest';

const { destroyMock, getPlaywrightPageMock, gotMock, responseTextMock, gotoMock } = vi.hoisted(() => ({
    destroyMock: vi.fn(),
    getPlaywrightPageMock: vi.fn(),
    gotMock: vi.fn(),
    responseTextMock: vi.fn(),
    gotoMock: vi.fn(),
}));

vi.mock('@/utils/got', () => ({
    default: gotMock,
}));

vi.mock('@/utils/playwright', () => ({
    getPlaywrightPage: getPlaywrightPageMock,
}));

import { fetchOfficialRss } from './official';

describe('Discourse official RSS', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        destroyMock.mockResolvedValue(undefined);
        responseTextMock.mockResolvedValue('<rss>browser</rss>');
        gotoMock.mockResolvedValue({
            ok: () => true,
            status: () => 200,
            text: responseTextMock,
        });
        getPlaywrightPageMock.mockResolvedValue({
            destroy: destroyMock,
            page: {
                goto: gotoMock,
            },
        });
    });

    it('uses the normal HTTP response without launching Chromium', async () => {
        gotMock.mockResolvedValue({ data: '<rss>http</rss>' });

        await expect(fetchOfficialRss('https://example.com/latest.rss', 'secret')).resolves.toBe('<rss>http</rss>');
        expect(gotMock).toHaveBeenCalledWith('https://example.com/latest.rss', {
            headers: {
                'User-Api-Key': 'secret',
            },
        });
        expect(getPlaywrightPageMock).not.toHaveBeenCalled();
    });

    it('does not send User-Api-Key when the configured key is empty', async () => {
        gotMock.mockResolvedValue({ data: '<rss>http</rss>' });

        await fetchOfficialRss('https://example.com/latest.rss', '');

        expect(gotMock).toHaveBeenCalledWith('https://example.com/latest.rss', {
            headers: undefined,
        });
    });

    it('falls back to Chromium when the HTTP request returns 403', async () => {
        const forbidden = Object.assign(new Error('403 Forbidden'), {
            response: {
                status: 403,
            },
        });
        gotMock.mockRejectedValue(forbidden);

        await expect(fetchOfficialRss('https://linux.do/c/news/34.rss')).resolves.toBe('<rss>browser</rss>');
        expect(getPlaywrightPageMock).toHaveBeenCalledWith('https://linux.do/c/news/34.rss', {
            closeTimeout: 45_000,
            noGoto: true,
        });
        expect(gotoMock).toHaveBeenCalledWith('https://linux.do/c/news/34.rss', {
            timeout: 30_000,
            waitUntil: 'domcontentloaded',
        });
        expect(destroyMock).toHaveBeenCalledOnce();
    });

    it('keeps the original 403 when the browser fallback is unavailable', async () => {
        const forbidden = Object.assign(new Error('403 Forbidden'), {
            response: {
                status: 403,
            },
        });
        gotMock.mockRejectedValue(forbidden);
        getPlaywrightPageMock.mockRejectedValue(new Error('Chromium executable not found'));

        await expect(fetchOfficialRss('https://example.com/latest.rss')).rejects.toBe(forbidden);
    });
});
