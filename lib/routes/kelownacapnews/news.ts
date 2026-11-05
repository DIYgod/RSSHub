import { load } from 'cheerio';
import Parser from 'rss-parser';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const parser = new Parser();

export const route: Route = {
    path: '/:type',
    categories: ['new-media'],
    example: '/kelownacapnews/local-news',
    parameters: { type: 'Type of news' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kelownacapnews.com/category/news/regional-news/', 'kelownacapnews.com/local-news'],
            target: '/local-news',
        },
        {
            source: ['www.kelownacapnews.com/category/news/regional-news/', 'www.kelownacapnews.com/local-news'],
            target: '/local-news',
        },
    ],
    name: 'News',
    maintainers: ['hualiong'],
    url: 'www.kelownacapnews.com',
    description: `\`type\` is as follows:

| News type     | Value         | News type    | Value        |
| ------------- | ------------- | ------------ | ------------ |
| News          | news          | Sports       | sports       |
| Local News    | local-news    | Business     | business     |
| Canadian News | national-news | Trending Now | trending-now |
| World News    | world-news    | Opinion      | opinion      |
| Entertainment | entertainment |              |              |`,
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const baseURL = 'https://kelownacapnews.com';

        const response = await ofetch.raw<string, 'text'>(`${baseURL}/${type}`, { responseType: 'text' });
        const $ = load(response._data!);
        const feedLink = $('link[rel="alternate"][type="application/rss+xml"]').attr('href');
        if (!feedLink) {
            throw new Error('Kelowna Capital News did not provide a category RSS feed. Check that the requested news category still exists.');
        }
        const feed = await parser.parseString(await ofetch(new URL(feedLink, response.url).href, { responseType: 'text' }));
        const items: DataItem[] = feed.items.map((item) => ({
            title: item.title ?? '',
            link: item.link,
            guid: item.guid,
            author: item.creator,
            pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
            description: item['content:encoded'] ?? item.content,
            category: item.categories,
        }));

        return {
            title: feed.title ?? `${$('title').text()} - Kelowna Capital News`,
            link: response.url,
            language: 'en' as const,
            item: items,
        };
    },
};
