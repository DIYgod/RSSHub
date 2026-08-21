import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import getItems from './items-processor';

export const route: Route = {
    path: '/sociedad/:subsection?',
    parameters: {
        subsection: {
            description: "Filter by subsection. Check the subsections available on the newspaper's website.",
        },
    },
    categories: ['traditional-media'],
    example: '/publico/sociedad',
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
            source: ['publico.es/sociedad'],
            target: '/sociedad',
        },
    ],
    name: 'Sociedad',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler(ctx) {
    const { subsection } = ctx.req.param();

    const rootUrl = 'https://www.publico.es';
    const currentUrl = subsection ? `${rootUrl}/sociedad/${subsection}` : `${rootUrl}/sociedad`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = getItems($);

    return {
        title: 'Medio Ambiente | Sociedad | Público',
        link: currentUrl,
        item: items,
    };
}
