import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route as daily } from '../lib/routes/readhub/daily';
import { processItems } from '../lib/routes/readhub/util';
import cache from '../lib/utils/cache';
import got from '../lib/utils/got';
import timelineFixture from './fixtures/readhub/timeline.json';
import topicFixture from './fixtures/readhub/topic.json';

vi.mock('../lib/utils/cache', () => ({ default: { tryGet: vi.fn() } }));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));

// Response shapes from public Readhub detail/timeline APIs on 2026-09-07.
// Values are synthetic; escaped text and explicit offsets exercise preservation.
const detailUrl = 'https://api.readhub.cn/topic/detail';
const timelineUrl = 'https://api.readhub.cn/topic/timeline/list';
const link = 'https://readhub.cn/topic/topic-42';
const input = { title: 'Daily summary', link, guid: 'topic-42', description: '<p>Incomplete summary</p>' };
const cached = new Map<string, unknown>();

beforeEach(() => {
    vi.clearAllMocks();
    cached.clear();
    vi.mocked(cache.tryGet).mockImplementation(async (key, fetchValue) => {
        if (cached.has(key)) {
            return cached.get(key);
        }
        const value = await fetchValue();
        cached.set(key, value);
        return value;
    });
    vi.mocked(got).mockImplementation((url) => {
        if (url === detailUrl) {
            return Promise.resolve({ data: structuredClone(topicFixture) });
        }
        if (url === timelineUrl) {
            return Promise.resolve({ data: structuredClone(timelineFixture) });
        }
        throw new Error('Unexpected upstream request');
    });
});

describe('Readhub API enrichment', () => {
    it('preserves the full summary, media, timeline, tags, title, GUID, and upstream publication date', async () => {
        const [item] = await processItems([input]);

        expect(item).toMatchObject({
            title: topicFixture.data.items[0].title,
            link,
            author: 'Source A',
            category: ['Entity', 'Technology'],
            guid: 'readhub-topic-42',
            pubDate: new Date('2026-09-06T09:40:34.084Z'),
        });
        expect(item.description).toContain('First paragraph.\nA quoted &quot;statement&quot;, path C:\\topic, and &lt;markup&gt;.');
        expect(item.description).toContain('<h3>媒体报道</h3>');
        expect(item.description).toContain('<a href="https://example.com/report-1">Report A</a>');
        expect(item.description).toContain('Source B');
        expect(item.description).toContain('<h3>事件追踪</h3>');
        expect(item.description).toContain('<a href="https://readhub.cn/topic/earlier-1">Earlier event</a>');
        expect(item.description).toContain('2026-09-05 10:03:04');
        expect(item.description).toContain('2026-09-04 15:04:05');
        expect(got).toHaveBeenNthCalledWith(1, detailUrl, { searchParams: { uid: 'topic-42' } });
        expect(got).toHaveBeenNthCalledWith(2, timelineUrl, { searchParams: { topic_uid: 'topic-42', size: 10 } });
        expect(input.guid).toBe('topic-42');
    });

    it('does not reuse or extend old cached summary-only items', async () => {
        cached.set(link, { ...input, guid: 'readhub-topic-42' });
        const [first] = await processItems([input]);
        const [second] = await processItems([{ ...input, title: 'Another route title' }]);

        expect(first).toEqual(second);
        expect(first.pubDate).toBeInstanceOf(Date);
        expect(cache.tryGet).toHaveBeenCalledWith('readhub:topic:v2:topic-42', expect.any(Function));
        expect(got).toHaveBeenCalledTimes(2);
    });

    it('selects the requested UID instead of another item in the response', async () => {
        const response = structuredClone(topicFixture);
        response.data.items.unshift({ ...response.data.items[0], uid: 'unrelated', title: 'Unrelated' });
        vi.mocked(got).mockResolvedValueOnce({ data: response });
        expect((await processItems([input]))[0].title).toBe(topicFixture.data.items[0].title);
    });

    it.each(['missing', 'duplicate'])('rejects a %s requested topic without caching the summary', async (kind) => {
        const response = structuredClone(topicFixture);
        if (kind === 'missing') {
            response.data.items[0].uid = 'unrelated';
        } else {
            response.data.items.push(response.data.items[0]);
        }
        vi.mocked(got).mockResolvedValueOnce({ data: response });
        await expect(processItems([input])).rejects.toThrow('does not contain the requested topic');
        expect(cached.size).toBe(0);
    });

    it.each([
        { data: { items: [{ ...topicFixture.data.items[0], publishDate: undefined }] } },
        { data: { items: [{ ...topicFixture.data.items[0], publishDate: 'not a date' }] } },
        { data: { items: [{ ...topicFixture.data.items[0], summary: '' }] } },
        { data: { items: [{ ...topicFixture.data.items[0], newsAggList: undefined }] } },
        '<html>Unexpected upstream page</html>',
    ])('rejects invalid detail data instead of returning an incomplete item', async (response) => {
        vi.mocked(got).mockResolvedValueOnce({ data: response });
        await expect(processItems([input])).rejects.toThrow('Readhub topic detail response is invalid');
        expect(cached.size).toBe(0);
    });

    it('retries after a failed enrichment rather than caching the fallback', async () => {
        vi.mocked(got).mockRejectedValueOnce(new Error('Upstream unavailable'));
        await expect(processItems([input])).rejects.toThrow('Upstream unavailable');
        expect(cached.size).toBe(0);
        expect((await processItems([input]))[0].pubDate).toEqual(new Date('2026-09-06T09:40:34.084Z'));
    });

    it('rejects a malformed timeline instead of dropping related events', async () => {
        vi.mocked(got)
            .mockResolvedValueOnce({ data: topicFixture })
            .mockResolvedValueOnce({ data: { data: {} } });
        await expect(processItems([input])).rejects.toThrow('Readhub topic timeline response is invalid');
        expect(cached.size).toBe(0);
    });

    it('accepts an explicitly empty timeline and optional tags without inventing related items', async () => {
        const response = { data: { items: [{ ...topicFixture.data.items[0], entityList: undefined, tagList: null }] } };
        vi.mocked(got)
            .mockResolvedValueOnce({ data: response })
            .mockResolvedValueOnce({ data: { data: { items: [] } } });
        const [item] = await processItems([input]);
        expect(item.category).toEqual([]);
        expect(item.description).toContain('媒体报道');
        expect(item.description).not.toContain('事件追踪');
        expect(item.pubDate).toEqual(new Date('2026-09-06T09:40:34.084Z'));
    });

    it.each(['https://example.com/article', 'https://readhub.cn.example.com/topic/topic-42'])('preserves external category items without fetching their pages: %s', async (externalLink) => {
        const external = { ...input, link: externalLink, pubDate: new Date('2026-09-01T00:00:00Z') };
        expect(await processItems([external])).toEqual([{ ...external, guid: 'readhub-topic-42' }]);
        expect(got).not.toHaveBeenCalled();
        expect(cache.tryGet).not.toHaveBeenCalled();
    });

    it('enriches daily summaries that contain no date and keeps the public feed URL', async () => {
        const upstreamMock = vi.mocked(got).getMockImplementation()!;
        vi.mocked(got).mockImplementation((url, options) => {
            if (url === 'https://api.readhub.cn/daily') {
                return Promise.resolve({ data: { data: { items: [{ uid: 'topic-42', title: input.title, summary: 'Daily summary' }] } } });
            }
            if (url === 'https://readhub.cn/daily') {
                return Promise.resolve({ data: '<meta name="application-name" content="Readhub"><link rel="apple-touch-icon" href="/icon.png">' });
            }
            return upstreamMock(url, options);
        });
        const feed = await daily.handler({ req: { query: vi.fn() } } as never);

        expect(feed.link).toBe('https://readhub.cn/daily');
        expect(feed.item).toHaveLength(1);
        expect(feed.item![0].pubDate).toEqual(new Date('2026-09-06T09:40:34.084Z'));
        expect(feed.item![0].description).toContain('Report A');
        expect(feed.item![0].description).toContain('Earlier event');
    });
});
