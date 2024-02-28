import got from '@/utils/got';
import { load } from 'cheerio';
const { isValidHost } = require('@/utils/valid-host');
const { headers, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { language = 'www', url = 'video' } = ctx.params;
    const link = `https://${language}.pornhub.com/${url}`;
    if (!isValidHost(language)) {
        throw new Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#videoCategory .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    ctx.set('data', {
        title: $('title').first().text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    });
};
