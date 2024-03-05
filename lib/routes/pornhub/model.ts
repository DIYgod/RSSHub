// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
const { headers, parseItems } = require('./utils');

export default async (ctx) => {
    const { language = 'www', username, sort = '' } = ctx.req.param();
    const link = `https://${language}.pornhub.com/model/${username}/videos${sort ? `?o=${sort}` : ''}`;
    if (!isValidHost(language)) {
        throw new Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#mostRecentVideosSection .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    ctx.set('data', {
        title: $('title').first().text(),
        description: $('section.aboutMeSection').text().trim(),
        link,
        image: $('#coverPictureDefault').attr('src'),
        logo: $('#getAvatar').attr('src'),
        icon: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        item: items,
    });
};
