import { Route } from '@/types';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

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
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const content = $('div.content').html();
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.creator,
                    description: content,
                };
            })
        )
    );

    return {
        title: feed.title,
        link: rootUrl,
        description: feed.description,
        language: feed.language,
        item: items,
    };
}
