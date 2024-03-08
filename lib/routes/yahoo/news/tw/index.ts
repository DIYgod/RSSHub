import { Route } from '@/types';
import cache from '@/utils/cache';
import { getArchive, getCategories, parseList, parseItem } from './utils';

export const route: Route = {
    path: '/news/:region/:category?',
    categories: ['traditional-media'],
    example: '/yahoo/news/hk/world',
    parameters: { region: 'Region, see the table below', category: 'Category, see the table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['yahoo.com/'],
    },
    name: 'News',
    maintainers: ['KeiLongW'],
    handler,
};

async function handler(ctx) {
    const { region, category } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new Error(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const categoryMap = await getCategories(region, cache.tryGet);
    const tag = category ? categoryMap[category].yctMap : null;

    const response = await getArchive(region, limit, tag);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `Yahoo 新聞 - ${category ? categoryMap[category].name : '所有類別'}`,
        link: `https://${region}.news.yahoo.com/${category ? `${category}/` : ''}archive`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
