import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news',
    categories: ['sport'],
    example: '/wfdf/news',
    parameters: {},
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
            source: ['wfdf.sport/news/', 'wfdf.sport/'],
        },
    ],
    name: 'News',
    maintainers: ['HankChow'],
    handler,
    url: 'wfdf.sport/news/',
};

async function handler(ctx) {
    const baseUrl = 'https://wfdf.sport';
    const { data: response } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: Math.min(getRouteLimit(ctx, 100), 100),
            _embed: 1,
        },
    });

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt, 0),
        author: item._embedded.author[0].name,
        category: item._embedded['wp:term'].flat().map((term) => term.name),
    }));

    return {
        title: 'WFDF News',
        link: `${baseUrl}/news/`,
        image: `${baseUrl}/favicon.ico`,
        description: 'WFDF 新闻',
        item: items,
    };
}
