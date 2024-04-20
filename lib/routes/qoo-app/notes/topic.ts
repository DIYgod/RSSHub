import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { notesUrl, extractNotes } from '../utils';

export const route: Route = {
    path: '/notes/:lang?/topic/:topic',
    name: 'Unknown',
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
