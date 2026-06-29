import { beforeEach, describe, expect, it, vi } from 'vitest';

const ofetch = vi.fn();

vi.mock('@/utils/ofetch', () => ({
    default: ofetch,
}));

const { buildZunaData } = await import('./routes/zuna/download');

describe('zuna download route', () => {
    beforeEach(() => {
        ofetch.mockReset();
        vi.setSystemTime(new Date('2026-06-30T00:00:00Z'));
    });

    it('builds a NetEase song item with native download metadata', async () => {
        ofetch
            .mockResolvedValueOnce({ data: { keyToken: 'token' } })
            .mockResolvedValueOnce({ ip: '' })
            .mockResolvedValueOnce({
                code: 200,
                data: {
                    url: 'https://m8.music.126.net/song.flac',
                    type: 'flac',
                    name: '再见莫妮卡',
                    artist: '彭席彦',
                    album: '再见莫妮卡',
                    size: '33.29MB',
                    level: '无损音质',
                },
            });

        const data = await buildZunaData('1824045033', 'lossless');

        expect(data.title).toBe('Zuna Download - 再见莫妮卡');
        expect(data.item?.[0]).toMatchObject({
            title: '再见莫妮卡 - 彭席彦',
            link: 'https://music.163.com/song?id=1824045033',
            enclosure_url: 'https://m8.music.126.net/song.flac',
            enclosure_type: 'audio/flac',
            enclosure_length: 34_907_095,
            author: '彭席彦',
            _extra: {
                provider: 'zuna',
                sourceUrl: 'https://m8.music.126.net/song.flac',
                format: 'flac',
                sampleRate: 44100,
                bitDepth: 16,
                level: 'lossless',
            },
        });
        expect(ofetch).toHaveBeenCalledWith('https://music.znnu.com/api/key', expect.objectContaining({ headers: { 'X-Referer': 'musicParser' } }));
        expect(ofetch).toHaveBeenCalledWith('https://music.znnu.com/api/song', expect.objectContaining({ method: 'POST' }));
        expect(ofetch.mock.calls[2][1]?.headers).toMatchObject({ 'X-Key-Token': 'token' });
        expect(String(ofetch.mock.calls[2][1]?.body)).toContain('act=song');
        expect(String(ofetch.mock.calls[2][1]?.body)).toContain('id=1824045033');
        expect(String(ofetch.mock.calls[2][1]?.body)).toContain('level=lossless');
    });

    it('extracts a song id from a NetEase URL', async () => {
        ofetch
            .mockResolvedValueOnce({ data: { keyToken: 'token' } })
            .mockResolvedValueOnce({ ip: '' })
            .mockResolvedValueOnce({
                code: 200,
                data: {
                    url: 'https://m8.music.126.net/song.mp3',
                    type: 'mp3',
                    name: 'Song',
                    artist: 'Artist',
                },
            });

        const data = await buildZunaData('https://music.163.com/song?id=33894312', 'exhigh');

        expect(data.item?.[0].link).toBe('https://music.163.com/song?id=33894312');
        expect(data.item?.[0]._extra).toMatchObject({
            provider: 'zuna',
            format: 'mp3',
            bitrate: 320,
            level: 'exhigh',
        });
    });
});
