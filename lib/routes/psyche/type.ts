import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getHtmlData } from './utils';

export const route: Route = {
    path: '/type/:type',
    categories: ['new-media'],
    example: '/psyche/type/ideas',
    parameters: { type: 'Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['psyche.co/ideas'], target: '/type/ideas' },
        { source: ['psyche.co/guides'], target: '/type/guides' },
        { source: ['psyche.co/films'], target: '/type/films' },
    ],
    name: 'Types',
    maintainers: ['emdoe'],
    handler,
    description: 'Supported types: Ideas, Guides, and Films.',
};

async function handler(ctx) {
    const url = `https://psyche.co/${ctx.req.param('type')}`;
    const response = await ofetch(url);
    const $ = load(response);

    return {
        title: $('head title').text(),
        link: $('link[rel="canonical"]').attr('href'),
        description: $('meta[name="description"]').attr('content'),
        item: await getHtmlData($),
    };
}
