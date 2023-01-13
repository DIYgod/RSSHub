const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { notesUrl } = require('../utils');

module.exports = async (ctx) => {
    const { topic, lang } = ctx.params;
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/topic/${topic}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const items = $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.qoo-note-view .content-title').text();
            const author = item.find('cite.name').text();
            const pubDate = timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8);
            item.find('cite.name, time, footer').remove();
            return {
                title,
                description: item.find('.qoo-note-view').html(),
                link: item.find('a.link-wrap').attr('href'),
                pubDate,
                author,
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
