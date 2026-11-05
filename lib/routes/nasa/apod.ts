import type { Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getAPODItems } from './utils';

export const route: Route = {
    path: '/apod',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/nasa/apod',
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
            source: ['apod.nasa.gov/apod/*path', 'apod.nasa.gov/apod'],
        },
        {
            source: ['science.nasa.gov/apod/*path', 'science.nasa.gov/apod'],
        },
    ],
    name: 'Astronomy Picture of the Day',
    maintainers: ['nczitzk', 'williamgateszhao'],
    handler,
    url: 'apod.nasa.gov/apod/',
};

async function handler(ctx) {
    const items = await getAPODItems(getRouteLimit(ctx, 10));

    return {
        title: 'NASA Astronomy Picture of the Day',
        link: 'https://science.nasa.gov/apod/archive/',
        item: items,
    };
}
