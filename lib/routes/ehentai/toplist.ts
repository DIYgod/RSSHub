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
    path: '/toplist/:category?/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/toplist/yesterday/0/bittorrent=true&embed_thumb=false&my_tags=true',
    parameters: {
        category: `Category, see table below. Defaults to 'yesterday'`,
        page: 'Page number',
        routeParams: 'Additional parameters, see the table above. E.g. `bittorrent=true&embed_thumb=false`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Toplist',
    maintainers: ['yindaheng98', 'syrinka', 'rosystain'],
    handler,
    description: `
| Yesterday | Past Month | Past Year | All Time  |
| :-------: | :--------: | :-------: | :-------: |
| yesterday | pastmonth  | pastyear  | alltime   |
`,
};

async function handler(ctx) {
    let category = ctx.req.param('category');
    let page = ctx.req.param('page');
    let routeParams = ctx.req.param('routeParams');

    // Case 3: /toplist/0/bittorrent=true -> category='0', page='bittorrent=true', routeParams=undefined
    if (page && !routeParams && (page.includes('bittorrent=') || page.includes('embed_thumb=') || page.includes('my_tags='))) {
        routeParams = page;
        page = category;
        category = 'yesterday';
    }

    // Case 1: /toplist/0 -> category='0', page=undefined
    // Case 2: /toplist/bittorrent=true -> category='bittorrent=true', page=undefined
    if (category && !page && !routeParams) {
        if (/^\d+$/.test(category)) {
            // Case 1
            page = category;
            category = 'yesterday';
        } else if (category.includes('bittorrent=') || category.includes('embed_thumb=') || category.includes('my_tags=')) {
            // Case 2
            routeParams = category;
            category = 'yesterday';
        }
    }

    category = category ?? 'yesterday';

    const tl = categoryMap[category] || 15;
    const routeParamsParsed = new URLSearchParams(routeParams);
    const bittorrent = routeParamsParsed.get('bittorrent') === 'true';
    const embed_thumb = routeParamsParsed.get('embed_thumb') === 'true';
    const my_tags = routeParamsParsed.get('my_tags') === 'true';

    const items = await EhAPI.getToplistItems(cache, tl, page, bittorrent, embed_thumb, my_tags);

    const title = Object.keys(categoryMap).find((key) => categoryMap[key] === tl) || 'yesterday';

    return {
        title: `E-Hentai Toplist - ${title}`,
        link: `https://e-hentai.org/toplist.php?tl=${tl}`,
        item: items,
    };
}
