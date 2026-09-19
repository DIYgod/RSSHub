import iconv from 'iconv-lite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/sciencenet/blog';
import type { Data } from '../lib/types';
import cache from '../lib/utils/cache';
import got from '../lib/utils/got';

vi.mock('../lib/utils/cache', () => ({ default: { tryGet: vi.fn() } }));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));

const rootUrl = 'http://blog.sciencenet.cn';
const indexUrl = `${rootUrl}/blog.php?mod=recommend&type=list&op=5&ord=1`;
const cached = new Map<string, unknown>();

// Synthetic GBK pages preserve the selectors used by the ScienceNet route.
const indexPage = (count: number) =>
    iconv.encode(`<table>${Array.from({ length: count }, (_, index) => `<tr><td><a title="博文 ${index}" href="blog-${index}.html">研究 ${index}</a><span>2026-09-07 10:30</span></td></tr>`).join('')}</table>`, 'gbk');
const articlePage = (index: number) =>
    iconv.encode(
        `<a class="xs2">作者 ${index}</a>${'<span class="xg1">Metadata</span>'.repeat(5)}<span class="xg1">2026-09-07 10:30</span><div id="blog_article"><p>完整正文 ${index} &amp; 科学</p><img src="https://example.com/figure-${index}.png"><math><mi>x</mi></math></div>`,
        'gbk'
    );
const context = (limit?: number) => ({ req: { param: vi.fn(), query: () => limit?.toString() } });

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
});

describe('ScienceNet bounded detail enrichment', () => {
    it('caps actual outstanding detail requests at three and preserves every item, order, content, date, and cache hit', async () => {
        const cachedIndexes = new Set([1, 6]);
        for (const index of cachedIndexes) {
            cached.set(`${rootUrl}/blog-${index}.html`, {
                title: `研究 ${index}`,
                link: `${rootUrl}/blog-${index}.html`,
                author: `Cached author ${index}`,
                description: `<p>Cached full article ${index}</p>`,
                pubDate: new Date('2026-09-07T02:30:00Z'),
            });
        }
        const started: number[] = [];
        const pending = new Map<number, () => void>();
        let active = 0;
        let peak = 0;
        vi.mocked(got).mockImplementation(({ url }) => {
            if (url === indexUrl) {
                return Promise.resolve({ data: indexPage(8) });
            }
            const index = Number(/blog-(\d+)\.html$/.exec(url)![1]);
            started.push(index);
            active++;
            peak = Math.max(peak, active);
            return new Promise((resolve) => {
                pending.set(index, () => {
                    active--;
                    pending.delete(index);
                    resolve({ data: articlePage(index) });
                });
            });
        });

        const feedPromise = route.handler(context(8) as never);
        await vi.waitFor(() => expect(started).toEqual([0, 2, 3]));
        for (let completed = 1; completed <= 6; completed++) {
            // Finish later items first; the emitted feed must retain source order.
            const index = Math.max(...pending.keys());
            pending.get(index)!();
            // oxlint-disable-next-line no-await-in-loop -- Advance one completion at a time to observe the concurrency bound.
            await vi.waitFor(() => expect(started.length).toBe(Math.min(completed + 3, 6)));
        }
        const feed = (await feedPromise) as Data;

        expect(peak).toBe(3);
        expect(active).toBe(0);
        expect(pending.size).toBe(0);
        expect(feed.item).toHaveLength(8);
        expect(feed.item!.map((item) => item.link)).toEqual(Array.from({ length: 8 }, (_, index) => `${rootUrl}/blog-${index}.html`));
        for (const [index, item] of feed.item!.entries()) {
            expect(item.title).toBe(`研究 ${index}`);
            expect(item.pubDate).toEqual(new Date('2026-09-07T02:30:00Z'));
            if (cachedIndexes.has(index)) {
                expect(item.description).toBe(`<p>Cached full article ${index}</p>`);
            } else {
                expect(item.description).toContain(`<p>完整正文 ${index} &amp; 科学</p>`);
                expect(item.description).toContain(`https://example.com/figure-${index}.png`);
                expect(item.description).toContain('<math><mi>x</mi></math>');
                expect(item.author).toBe(`作者 ${index}`);
            }
        }
        expect(started).toHaveLength(6);
        expect(cache.tryGet).toHaveBeenCalledTimes(8);
        const warmFeed = (await route.handler(context(8) as never)) as Data;
        expect(warmFeed.item).toEqual(feed.item);
        expect(started).toHaveLength(6);
    });

    it('preserves the documented default of up to fifty full articles', async () => {
        vi.mocked(got).mockImplementation(({ url }) => {
            if (url === indexUrl) {
                return Promise.resolve({ data: indexPage(55) });
            }
            const index = Number(/blog-(\d+)\.html$/.exec(url)![1]);
            return Promise.resolve({ data: articlePage(index) });
        });
        const feed = (await route.handler(context() as never)) as Data;

        expect(feed.item).toHaveLength(50);
        expect(feed.item![49].description).toContain('完整正文 49');
        expect(got).toHaveBeenCalledTimes(51);
        expect(cache.tryGet).toHaveBeenCalledTimes(50);
    });

    it('propagates failed detail requests without caching incomplete items', async () => {
        vi.mocked(got)
            .mockResolvedValueOnce({ data: indexPage(1) })
            .mockRejectedValueOnce(new Error('Upstream unavailable'));
        await expect(route.handler(context(1) as never)).rejects.toThrow('Upstream unavailable');
        expect(cached.size).toBe(0);
    });
});
