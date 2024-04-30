import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseItem } from './utils';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:category_id',
    categories: ['traditional-media'],
    example: '/scmp/3',
    parameters: { category_id: 'Category' },
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
            source: ['scmp.com/rss/:category_id/feed'],
        },
    ],
    name: 'News',
    maintainers: ['proletarius101'],
    handler,
    description: `See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.`,
};

async function handler(ctx) {
    const categoryId = ctx.req.param('category_id');
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const rss = await parser.parseURL(rssUrl);

    const items = await Promise.all(rss.items.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('json', {
        items,
    });

    return {
        ...rss,
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
    };
}
