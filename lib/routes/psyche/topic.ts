import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getHtmlData } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media'],
    example: '/psyche/topic/therapeia',
    parameters: { topic: 'Topic' },
    radar: [
        { source: ['psyche.co/therapeia'], target: '/topic/therapeia' },
        { source: ['psyche.co/eudaimonia'], target: '/topic/eudaimonia' },
        { source: ['psyche.co/poiesis'], target: '/topic/poiesis' },
    ],
    name: 'Topics',
    maintainers: ['emdoe'],
    handler,
    description: 'Supported categories: Therapeia, Eudaimonia, and Poiesis.',
};

async function handler(ctx) {
    const url = `https://psyche.co/${ctx.req.param('topic')}`;
    const response = await ofetch(url);
    const $ = load(response);

    return {
        title: $('head title').text(),
        link: $('link[rel="canonical"]').attr('href'),
        description: $('meta[name="description"]').attr('content'),
        item: await getHtmlData($),
    };
}
