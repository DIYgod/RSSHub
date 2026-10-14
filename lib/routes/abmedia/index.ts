import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const rootUrl = 'https://www.abmedia.io';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export const route: Route = {
    path: '/index',
    categories: ['new-media'],
    example: '/abmedia/index',
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
            source: ['abmedia.io/'],
            target: '/index',
        },
        {
            source: ['www.abmedia.io/'],
            target: '/index',
        },
    ],
    name: '首页最新新闻',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.abmedia.io/',
};

async function handler(ctx) {
    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const url = `${postsAPIUrl}?per_page=${limit}`;

    const response = await got.get(url);
    const data = response.data;

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(`${item.date_gmt}Z`),
    }));

    return {
        title: 'ABMedia - 最新消息',
        link: rootUrl,
        item: items,
    };
}
