import { beforeEach, describe, expect, it, vi } from 'vitest';

import { processFeed, processFeedType2 } from '../lib/routes/dongqiudi/utils';
import nintendo from '../lib/routes/nintendo/utils';
import cache from '../lib/utils/cache';
import got from '../lib/utils/got';

vi.mock('../lib/utils/cache', () => ({
    default: { tryGet: vi.fn((_key, getValue) => getValue()) },
}));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Nintendo Nuxt data', () => {
    it('reads serialized object references and escaped content without executing page scripts', () => {
        const html = `<script>console.log(window.__NUXT__);throw new Error('Unrelated page code');</script>
        <script>window.__NUXT__=(function(a,b){a.title=b;a.content="<p>A&amp;B</p>";return {data:[{newsList:[a],newsData:a}]}}({},"News \\u4e2d\\u6587"));</script>`;

        expect(nintendo.nuxtReader(html)).toEqual({
            newsList: [{ title: 'News 中文', content: '<p>A&amp;B</p>' }],
            newsData: { title: 'News 中文', content: '<p>A&amp;B</p>' },
        });
    });

    it('preserves cached article content, category, and publication time', async () => {
        const link = 'https://www.nintendoswitch.com.cn/topics/test';
        vi.mocked(got).mockResolvedValue({
            data: '<script>window.__NUXT__={data:[{newsData:{content:"<p>Article</p>",category:["News"],releaseTime:1704067200000}}]};</script>',
        });

        const items = await nintendo.ProcessNewsChina([{ link, description: '<img src="cover.png">' }], cache);

        expect(cache.tryGet).toHaveBeenCalledWith(link, expect.any(Function));
        expect(items[0]).toEqual({
            link,
            description: '<img src="cover.png"><p>Article</p>',
            category: ['News'],
            pubDate: new Date('2024-01-01T00:00:00.000Z'),
        });
    });

    it.each(['<html>No page data</html>', '<script>window.__NUXT__=fetch("https://example.com");</script>'])('rejects missing or executable page data', (html) => {
        expect(() => nintendo.nuxtReader(html)).toThrow('Nuxt 框架信息提取失败');
    });
});

describe('Dongqiudi Nuxt data', () => {
    const articleHtml = `<script>throw new Error('Unrelated page code');</script>
    <script>window.__NUXT__=(function(a){return {data:[{article:{rawBody:a,author:"Reporter"}}]}}('<p>Match report</p><a href="dongqiudi:///news/42">Related</a><img src="https://example.com/image.jpg?watermark=1">'));</script>`;

    it('preserves article content cleanup and the author', () => {
        const item: { title: string; description?: string; author?: string } = { title: 'Match' };

        processFeedType2(item, articleHtml);

        expect(item).toEqual({
            title: 'Match',
            description: '<p>Match report</p><a href="https://www.dongqiudi.com/article/42">Related</a><img src="https://example.com/image.jpg">',
            author: 'Reporter',
        });
    });

    it.each(['<html>No Nuxt data</html>', '<script>window.__NUXT__={data:[{}]};</script>', '<script>window.__NUXT__=null;</script>'])('leaves an item unchanged when article data is absent', (html) => {
        const item = { title: 'Match' };
        processFeedType2(item, html);
        expect(item).toEqual({ title: 'Match' });
    });

    it.each([
        ['team', 'teamInfo:{name:"Club",logo:"club.png"}', 'Club', 'club.png'],
        ['player', 'detail:{base_info:{person_name:"Player",person_logo:"player.png"}}', 'Player', 'player.png'],
    ])('keeps the %s metadata, API request, and article cache', async (type, metadata, name, image) => {
        vi.mocked(got)
            .mockResolvedValueOnce({ data: `<script>window.__NUXT__={data:[{${metadata}}]};</script>` })
            .mockResolvedValueOnce({ data: { data: { articles: [{ id: 42, title: 'Match', category: 'Football', show_time: 1_704_067_200 }] } } })
            .mockResolvedValueOnce({ data: articleHtml });

        const feed = await processFeed(type, '123');

        expect(feed.title).toBe(`${name} - 相关新闻`);
        expect(feed.image).toBe(image);
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0]).toMatchObject({ author: 'Reporter', category: ['Football'], pubDate: new Date('2024-01-01T00:00:00.000Z') });
        expect(cache.tryGet).toHaveBeenCalledWith('https://www.dongqiudi.com/articles/42.html', expect.any(Function));
        expect(got).toHaveBeenNthCalledWith(2, 'https://api.dongqiudi.com/v3/archive/app/channel/feeds', {
            searchParams: { id: '123', type, size: 20, platform: 'web', version: '' },
        });
    });
});
