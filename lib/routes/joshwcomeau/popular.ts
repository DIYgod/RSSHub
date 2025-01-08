import { Data, Route } from '@/types';
import { getRelativeUrlList, processList, rootUrl } from './utils';

export const route: Route = {
    path: '/popular/:dateSort?',
    categories: ['programming'],
    example: '/popular/false',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        dateSort: {
            description: 'Sort posts by publication date instead of popularity',
            default: 'true',
            options: [
                { value: 'false', label: 'False' },
                { value: 'true', label: 'True' },
            ],
        },
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

async function handler(ctx) {
    const dateSort = ctx.req.param('dateSort') ? JSON.parse(ctx.req.param('dateSort')) : true;
    const { urls } = await getRelativeUrlList(rootUrl, 'section > ol > li > a');
    const items = await processList(urls, { dateSort });
    return {
        title: 'Popular Content | Josh W. Comeau',
        description: 'Friendly tutorials for developers. Focus on React, CSS, Animation, and more!',
        link: rootUrl,
        item: items,
        icon: `${rootUrl}/favicon.png`,
        logo: `${rootUrl}/favicon.png`,
    } as Data;
}
