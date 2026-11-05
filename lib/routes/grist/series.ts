import NotFoundError from '@/errors/types/not-found';
import type { Data, Route } from '@/types';

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

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/series?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?series=';
    const series = ctx.req.param('series');
    const seriesData = (await getData(`${baseUrl}${searchRoute}${encodeURIComponent(series)}`))[0];
    if (!seriesData) {
        throw new NotFoundError(`Grist did not return a series for '${series}'. Check the series slug in the source URL.`);
    }
    const data = await getData(`${baseUrl}${articleRoute}${seriesData.id}&_embed`);
    const items = await getList(data);

    return {
        title: `${seriesData.name} - Grist Articles`,
        link: seriesData.link,
        item: items,
        description: `${seriesData.name} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
}
