import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';

const categoryMap = {
    yesterday: 15,
    pastmonth: 13,
    pastyear: 12,
    alltime: 11,
};

export const route: Route = {
    path: '/toplist/:category?',
    categories: ['picture'],
    example: '/ehentai/toplist/yesterday',
    parameters: {
        category: `Category, see table below. Defaults to 'yesterday'`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Toplist',
    maintainers: ['syrinka'],
    handler,
    description: `
| Yesterday | Past Month | Past Year | All Time  |
| :-------: | :--------: | :-------: | :-------: |
| yesterday | pastmonth  | pastyear  | alltime   |
`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'yesterday';
    const tl = categoryMap[category] || 15;

    const items = await EhAPI.getToplistItems(cache, tl);

    const title = Object.keys(categoryMap).find((key) => categoryMap[key] === tl) || 'yesterday';

    return {
        title: `E-Hentai Toplist - ${title}`,
        link: `https://e-hentai.org/toplist.php?tl=${tl}`,
        item: items,
    };
}
