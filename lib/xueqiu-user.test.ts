import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '@/routes/xueqiu/user';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

vi.mock('@/utils/ofetch', () => ({ default: vi.fn() }));
vi.mock('@/routes/xueqiu/cookies', () => ({ parseToken: vi.fn().mockResolvedValue('') }));

// Synthetic timeline/detail payloads; every upstream request is mocked.
const fetchMock = vi.mocked(ofetch);
const invoke = () => (route.handler as any)({ req: { param: (key: string) => (key === 'id' ? 'fixture-owner' : undefined) } });
const status = (extra: any = {}) => ({ id: 1, target: '/fixture-owner/1', created_at: 1_767_225_600_000, user: { screen_name: 'Fixture' }, description: 'list summary', truncated: true, ...extra });

describe('Xueqiu timeline text and fallback rendering', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        cache.clients.memoryCache?.clear();
    });

    for (const truncated of [false, undefined]) {
        it(`reuses complete list text without requesting detail: truncated=${truncated}`, async () => {
            fetchMock.mockResolvedValueOnce({
                statuses: [status({ text: '<p>full list text</p>', legal_user_visible: false, truncated, image_info_list: [{ filename: 'fixture.png' }], retweeted_status: { user: { screen_name: 'Quoted' }, text: 'quoted text' } })],
            });
            const result = await invoke();
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(result.item[0]).toMatchObject({ title: 'full list text', link: 'https://xueqiu.com/fixture-owner/1' });
            expect(result.item[0].description).toContain('<p>full list text</p>');
            expect(result.item[0].description).toContain('https://xqimg.imedao.com/fixture.png');
            expect(result.item[0].description).toContain('Quoted:&nbsp;quoted text');
        });
    }

    it('still fetches detail when list text is explicitly truncated', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ text: 'preview', truncated: true })] }).mockResolvedValueOnce({ text: '<p>complete detail</p>' });
        expect((await invoke()).item[0].description).toBe('<p>complete detail</p>');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('preserves media on the existing legal-user list shortcut', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ legal_user_visible: true, image_info_list: [{ filename: 'fixture.png' }], retweeted_status: { description: 'quoted description' } })] });
        const item = (await invoke()).item[0];
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(item.description).toContain('list summary');
        expect(item.description).toContain('fixture.png');
        expect(item.description).toContain('quoted description');
        expect(item.description).not.toContain('undefined');
    });

    it('does not skip detail just because legal_user_visible is true with no content', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ legal_user_visible: true, text: '', description: '' })] }).mockResolvedValueOnce({ text: 'complete detail' });
        expect((await invoke()).item[0].description).toBe('complete detail');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    for (const text of [' '.repeat(3), 123, undefined]) {
        it(`uses a valid description when list text is unusable: ${String(text)}`, async () => {
            fetchMock.mockResolvedValueOnce({ statuses: [status({ text, legal_user_visible: true, description: '<p>usable description</p>', image_info_list: {} })] });
            const item = (await invoke()).item[0];
            expect(item.title).toBe('usable description');
            expect(item.description).toBe('<p>usable description</p>');
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    }

    it('keeps text, pictures and repost when a detail request fails', async () => {
        fetchMock
            .mockResolvedValueOnce({ statuses: [status({ text: 'current list text', image_info_list: [{ filename: 'current.png' }], retweeted_status: { text: 'quoted text' } })] })
            .mockRejectedValueOnce(new Error('temporary failure'));
        const item = (await invoke()).item[0];
        expect(item.title).toBe('current list text');
        expect(item.description).toContain('current list text');
        expect(item.description).toContain('current.png');
        expect(item.description).toContain('quoted text');
        expect(item.description).not.toContain('undefined');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('retains description-only details with empty text and missing repost author', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status()] }).mockResolvedValueOnce({ text: '', description: '<p>detail description</p>', retweeted_status: { description: 'quoted description' } });
        const item = (await invoke()).item[0];
        expect(item.description).toContain('<p>detail description</p>');
        expect(item.description).toContain('quoted description');
        expect(item.description).not.toContain('undefined');
    });
});
