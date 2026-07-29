import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { extractNotes, notesUrl } from '../utils';

export const route: Route = {
    path: '/notes/:lang?/topic/:topic',
    categories: ['anime'],
    example: '/qoo-app/notes/en/topic/QooAppGacha',
    parameters: { lang: 'Language, see the table above, empty means `中文`', topic: 'Hashtag name without `#`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Hot Hashtags',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { topic, lang } = ctx.req.param();
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/topic/${topic}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const items = extractNotes($);

    return {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
}
