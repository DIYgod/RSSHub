import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/xiaoyuzhou/podcast';
import ofetch from '../lib/utils/ofetch';

vi.mock('../lib/utils/ofetch', () => ({ default: vi.fn() }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: (_key: string, fetchValue: () => unknown) => fetchValue() } }));

const context = { req: { param: () => 'source-id' } } as any;
const podcastHtml = `<script id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: { podcast: { pid: 'podcast-id', title: 'Podcast', image: {}, episodes: [] } } } })}</script>`;

beforeEach(() => vi.resetAllMocks());

describe('Xiaoyuzhou podcast and episode resolution', () => {
    it('preserves a podcast access error without requesting the same ID as an episode', async () => {
        const blocked = Object.assign(new Error('Forbidden'), { status: 403 });
        vi.mocked(ofetch).mockRejectedValue(blocked);

        await expect(route.handler!(context)).rejects.toBe(blocked);
        expect(ofetch).toHaveBeenCalledTimes(1);
    });

    it('resolves episode IDs when the podcast URL returns 404', async () => {
        vi.mocked(ofetch)
            .mockRejectedValueOnce(Object.assign(new Error('Not Found'), { status: 404 }))
            .mockResolvedValueOnce('<a class="name" href="/podcast/podcast-id">Podcast</a>')
            .mockResolvedValueOnce(podcastHtml);

        await expect(route.handler!(context)).resolves.toMatchObject({ title: 'Podcast', link: 'https://www.xiaoyuzhoufm.com/podcast/podcast-id' });
        expect(ofetch).toHaveBeenNthCalledWith(2, 'https://www.xiaoyuzhoufm.com/episode/source-id');
        expect(ofetch).toHaveBeenCalledTimes(3);
    });

    it('does not hide malformed page data behind an unrelated episode request', async () => {
        vi.mocked(ofetch).mockResolvedValue('<html>Unexpected response</html>');

        await expect(route.handler!(context)).rejects.toBeInstanceOf(SyntaxError);
        expect(ofetch).toHaveBeenCalledTimes(1);
    });
});
