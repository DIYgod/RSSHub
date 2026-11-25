import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

const rootUrl = 'https://tech.meituan.com/';

export const route: Route = {
    path: '/tech',
    categories: ['programming'],
    example: '/meituan/tech',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['tech.meituan.com'],
        },
    ],
    name: '技术团队博客',
    url: 'tech.meituan.com',
    maintainers: ['ktKongTong', 'cscnk52'],
    handler,
};

async function handler() {
    const rssUrl = `${rootUrl}feed/`;
    const rss = await ofetch(rssUrl);
    const feed = await parser.parseString(rss);
    const items = await pMap(
        feed.items,
        async (item) => {
            const detail = await cache.tryGet(`meituan:tech:detail:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const publishedDate = $('.vp-post-date').text().trim();
                const author = $('.vp-post-department').text().trim();
                $('.vp-post-header').remove();
                return {
                    author,
                    description: $('.vp-page-content').html(),
                    pubDate: parseDate(publishedDate, 'YYYY-MM-DD'),
                };
            });
            return {
                title: item.title!,
                link: item.link,
                pubDate: detail.pubDate,
                author: detail.author,
                description: detail.description,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: feed.title!,
        link: rootUrl,
        description: feed.description,
        language: feed.language,
        item: items,
    };
}
