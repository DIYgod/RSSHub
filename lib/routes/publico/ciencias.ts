import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

import getItems from './items-processor';

export const route: Route = {
    path: '/ciencias/:subsection?',
    parameters: {
        subsection: {
            description: "Filter by subsection. Check the subsections available on the newspaper's website.",
        },
    },
    categories: ['traditional-media'],
    example: '/publico/ciencias',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['publico.es/ciencias'],
            target: '/ciencias',
        },
    ],
    name: 'Ciencias',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler(ctx) {
    const { subsection } = ctx.req.param();

    const rootUrl = 'https://www.publico.es';
    const currentUrl = subsection ? `${rootUrl}/ciencias/${subsection}` : `${rootUrl}/ciencias`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const title = $('.article-section h1').text();
    const items = getItems($);

    return {
        title: `${title} | Público`,
        link: currentUrl,
        item: items,
    };
}
