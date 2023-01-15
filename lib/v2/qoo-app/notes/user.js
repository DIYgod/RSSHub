const got = require('@/utils/got');
const cheerio = require('cheerio');
const { notesUrl, extractNotes } = require('../utils');

module.exports = async (ctx) => {
    const { uid, lang } = ctx.params;
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/user/${uid}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const items = extractNotes($);

    ctx.state.data = {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
