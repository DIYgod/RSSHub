import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { extractNotes, notesUrl } from '../utils';

export const route: Route = {
    path: '/notes/:lang?/user/:uid',
    categories: ['anime'],
    example: '/qoo-app/notes/en/user/35399143',
    parameters: { lang: 'Language, see the table above, empty means `中文`', uid: 'User ID, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Notes',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { uid, lang } = ctx.req.param();
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/user/${uid}`;

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
