import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
import { art } from '@/utils/render';
import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/news/:category?',
    categories: ['traditional-media'],
    example: '/i-cable/news',
    parameters: { category: '分類，默認為新聞資訊' },
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
            source: ['www.i-cable.com'],
            target: '/news',
        },
        {
            source: ['www.i-cable.com/category/:category'],
            target: '/news/:category',
        },
    ],
    name: '新聞',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    url: 'www.i-cable.com/',
    description: `
:::tip
分類只可用分類名稱，如：新聞資訊/港聞
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '新聞資訊';
    const limit = ctx.req.query('limit') ?? 20;
    const root = 'https://www.i-cable.com/wp-json/wp/v2';

    const response = await cache.tryGet(`${root}/categories?slug=${category}`, async () => await got(`${root}/categories?slug=${category}`), config.cache.routeExpire, false);
    if (response.data.length < 1) {
        throw new InvalidParameterError(`Invalid Category: ${category}`);
    }
    const metadata = response.data[0];

    const list = await got(`${root}/posts?_embed=1&categories=${metadata.id}&per_page=${limit}`);
    const items = list.data.map((item) => {
        const description = art(path.join(__dirname, 'templates/description.art'), {
            media: item._embedded['wp:featuredmedia'] ?? [],
            content: item.content.rendered,
        });
        return {
            title: item.title.rendered,
            link: item.link,
            pubDate: item.date_gmt,
            description,
            category: item._embedded['wp:term'][0].map((term) => term.name) ?? [],
        };
    });

    return {
        title: `有線新聞 - ${metadata.name}`,
        description: metadata.description,
        link: metadata.link,
        item: items,
    };
}
