// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { notesUrl, extractNotes } = require('../utils');

export default async (ctx) => {
    const { uid, lang } = ctx.req.param();
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/user/${uid}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const items = extractNotes($);

    ctx.set('data', {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    });
};
