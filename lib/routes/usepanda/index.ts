import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/feeds/:id',
    categories: ['other'],
    example: '/usepanda/feeds/5718e53e7a84fb1901e059cc',
    parameters: { id: 'Feed ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Feeds',
    maintainers: ['lyrl'],
    handler,
    description: `| Channel | feedId                   |
| ------- | ------------------------ |
| Github  | 5718e53e7a84fb1901e059cc |`,
};

async function handler(ctx) {
    const feedId = ctx.req.param('id');
    const requestedLimit = Math.trunc(Number(ctx.req.query('limit')));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;

    const rootUrl = 'https://api-panda.com/v4/';
    const apiUrl = `${rootUrl}articles?feeds=${feedId}&limit=${limit}&page=1&sort=popular`;

    const { data } = await got(apiUrl);

    const items = data.map((item) => ({
        title: `${item.title} 🌟 ${item.source.likesCount}`,
        author: item.source.username,
        pubDate: item.source.createdAt ? parseDate(item.source.createdAt) : undefined,
        link: item.source.targetUrl,
        description: item.description,
    }));

    return {
        title: 'Panda Feeds',
        link: 'https://usepanda.com/',
        item: items,
    };
}
