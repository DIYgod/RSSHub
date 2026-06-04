import type { Data, Route } from '@/types';

import { getRelativeUrlList, processList, rootUrl } from './utils';

export const route: Route = {
    path: '/popular',
    categories: ['programming'],
    example: '/joshwcomeau/popular',
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
            source: ['joshwcomeau.com/'],
            target: '/popular',
        },
    ],
    name: 'Popular Content',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const { urls } = await getRelativeUrlList(rootUrl, 'section > ol > li > a');
    const items = await processList(urls);
    return {
        title: 'Popular Content | Josh W. Comeau',
        description: 'Friendly tutorials for developers. Focus on React, CSS, Animation, and more!',
        link: rootUrl,
        item: items,
        icon: `${rootUrl}/favicon.png`,
        logo: `${rootUrl}/favicon.png`,
    } as Data;
}
