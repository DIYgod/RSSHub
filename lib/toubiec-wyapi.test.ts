import { beforeEach, describe, expect, it, vi } from 'vitest';

const ofetch = vi.fn();

vi.mock('@/utils/ofetch', () => ({
    default: ofetch,
}));

const { buildWyapiData } = await import('./routes/toubiec/wyapi');

describe('toubiec wyapi route', () => {
    beforeEach(() => {
        ofetch.mockReset();
    });

    it('builds a song item with audio enclosure and lyrics', async () => {
        ofetch.mockResolvedValueOnce({ code: 200, data: { url: 'https://m8.music.126.net/song.mp3', br: 320000, level: 'exhigh', size: 1024 } }).mockResolvedValueOnce({ code: 200, data: { lrc: '[00:00.000] lyric', tlyric: '' } });

        const data = await buildWyapiData('song', 'https://music.163.com/song?id=33894312', 'exhigh', 1);

        expect(data.item?.[0]).toMatchObject({
            title: '33894312',
            link: 'https://music.163.com/song?id=33894312',
            enclosure_url: 'https://m8.music.126.net/song.mp3',
            enclosure_type: 'audio/mpeg',
            enclosure_length: 1024,
        });
        expect(data.item?.[0].description).toContain('歌词');
        expect(ofetch).toHaveBeenCalledWith('https://nextmusic.toubiec.cn/api/getSongUrl', expect.objectContaining({ method: 'POST' }));
        expect(ofetch).toHaveBeenCalledWith('https://nextmusic.toubiec.cn/api/getSongLyric', expect.objectContaining({ method: 'POST' }));
    });

    it('uses keyword, limit, and offset for search', async () => {
        ofetch
            .mockResolvedValueOnce({ code: 200, data: { songs: [{ id: 1, name: 'Song', singer: 'Artist' }], songCount: 1 } })
            .mockResolvedValueOnce({ code: 200, data: { url: 'https://m8.music.126.net/song.flac', level: 'lossless', size: 2048 } });

        const data = await buildWyapiData('search', '晴天', 'lossless', 1);

        expect(data.title).toContain('搜索 晴天');
        expect(data.item?.[0].title).toBe('Song - Artist');
        expect(JSON.parse(ofetch.mock.calls[0][1]?.body as string)).toMatchObject({
            keyword: '晴天',
            limit: 1,
            offset: 0,
        });
    });

    it('paginates playlists until enough songs are collected', async () => {
        const firstPageSongs = Array.from({ length: 500 }, (_, index) => ({ id: index + 1, name: `Song ${index + 1}` }));
        ofetch
            .mockResolvedValueOnce({ code: 200, data: { name: 'Playlist', songs: firstPageSongs } })
            .mockResolvedValueOnce({ code: 200, data: { name: 'Playlist', songs: [{ id: 501, name: 'Song 501' }] } })
            .mockResolvedValue({ code: 200, data: { url: 'https://m8.music.126.net/song.mp3', level: 'exhigh' } });

        const data = await buildWyapiData('playlist', '3778678', 'exhigh', 501);

        expect(data.item).toHaveLength(501);
        expect(JSON.parse(ofetch.mock.calls[0][1]?.body as string)).toMatchObject({ id: '3778678', limit: 500, offset: 0 });
        expect(JSON.parse(ofetch.mock.calls[1][1]?.body as string)).toMatchObject({ id: '3778678', limit: 500, offset: 500 });
    });
});
