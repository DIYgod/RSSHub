import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSrtAttachment, getSrtAttachmentBatch, getSubtitlesByVideoId } from '../lib/routes/youtube/api/subtitles';

const mocks = vi.hoisted(() => ({
    isWorker: false,
    cached: new Map<string, string>(),
    tryGet: vi.fn(),
    getSubtitles: vi.fn(),
}));

vi.mock('../lib/utils/is-worker', () => ({
    get isWorker() {
        return mocks.isWorker;
    },
}));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('youtube-caption-extractor', () => ({ getSubtitles: mocks.getSubtitles }));

const expectedSrt = '1\n00:00:00,250 --> 00:00:01,750\nHello & 字幕\n\n2\n00:01:01,125 --> 00:01:03,625\nSecond caption\n';
const cachedSrt = '1\n00:00:00,000 --> 00:00:01,000\nPreviously cached\n';

beforeEach(() => {
    mocks.isWorker = false;
    mocks.cached.clear();
    mocks.tryGet.mockReset().mockImplementation((key: string, getValue: () => Promise<string>) => (mocks.cached.has(key) ? Promise.resolve(mocks.cached.get(key)) : getValue()));
    mocks.getSubtitles.mockReset().mockResolvedValue([
        { start: '0.25', dur: '1.5', text: 'Hello & 字幕' },
        { start: '61.125', dur: '2.5', text: 'Second caption' },
    ]);
});

describe('YouTube subtitles by runtime', () => {
    it('skips all Worker subtitle paths before reading even existing cached subtitles', async () => {
        mocks.isWorker = true;
        mocks.cached.set('youtube:getSubtitlesByVideoId:cached', cachedSrt);

        expect(await getSubtitlesByVideoId('fresh')).toBe('');
        expect(await getSubtitlesByVideoId('cached')).toBe('');
        expect(await getSrtAttachment('cached')).toEqual([]);
        expect(await getSrtAttachmentBatch(['fresh', 'cached'])).toEqual({});

        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.getSubtitles).not.toHaveBeenCalled();
    });

    it('still extracts and converts subtitle segments to SRT on Node', async () => {
        expect(await getSubtitlesByVideoId('fresh')).toBe(expectedSrt);

        expect(mocks.tryGet).toHaveBeenCalledExactlyOnceWith('youtube:getSubtitlesByVideoId:fresh', expect.any(Function));
        expect(mocks.getSubtitles).toHaveBeenCalledExactlyOnceWith({ videoID: 'fresh' });
    });

    it('preserves Node SRT attachments for fetched and cached videos', async () => {
        mocks.cached.set('youtube:getSubtitlesByVideoId:cached', cachedSrt);

        const attachments = await getSrtAttachmentBatch(['fresh', 'cached']);
        expect(attachments).toEqual({
            fresh: [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(expectedSrt)}`, mime_type: 'text/srt', title: 'Subtitles' }],
            cached: [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(cachedSrt)}`, mime_type: 'text/srt', title: 'Subtitles' }],
        });
        expect(await getSrtAttachment('cached')).toEqual(attachments.cached);
        expect(mocks.getSubtitles).toHaveBeenCalledExactlyOnceWith({ videoID: 'fresh' });
        expect(mocks.tryGet).toHaveBeenCalledWith('youtube:getSubtitlesByVideoId:cached', expect.any(Function));
    });
});
