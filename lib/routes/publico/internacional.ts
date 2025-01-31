import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

import getItems from './items-processor';

export const route: Route = {
    path: '/internacional/:subsection?',
    categories: ['traditional-media'],
    example: '/internacional',
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
            source: ['publico.es/internacional'],
            target: '/internacional',
        },
    ],
    name: 'Internacional - Público',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler(ctx) {
    const { subsection } = ctx.req.param();

    const rootUrl = 'https://www.publico.es';
    const currentUrl = subsection ? `${rootUrl}/internacional/${subsection}` : `${rootUrl}/internacional`;

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
