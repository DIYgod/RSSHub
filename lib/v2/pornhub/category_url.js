const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');
const { headers, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { language = 'www', url = 'video' } = ctx.params;
    const link = `https://${language}.pornhub.com/${url}`;
    if (!isValidHost(language)) {
        throw Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = cheerio.load(response);
    const items = $('#videoCategory .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    ctx.state.data = {
        title: $('title').first().text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
