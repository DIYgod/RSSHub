import type { Route } from '@/types';

import { getData, getList } from './utils';

export const route: Route = {
    path: '/series/:series',
    categories: ['new-media'],
    example: '/grist/series/best-of-grist',
    parameters: { series: 'Find in the URL which has /series/' },
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
            source: ['grist.org/series/:series'],
        },
    ],
    name: 'Series',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'grist.org/articles/',
};

async function handler(ctx) {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/series?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?series=';
    const series = ctx.req.param('series');
    const id = (await getData(`${baseUrl}${searchRoute}${series}`))[0].id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    return {
        title: `${series[0].toUpperCase() + series.slice(1)} - Gist Articles`,
        link: `${baseUrl}/${series}`,
        item: items,
        description: `${series[0].toUpperCase() + series.slice(1)} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
}
