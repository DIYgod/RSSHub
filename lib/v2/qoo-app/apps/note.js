const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { appsUrl } = require('../utils');

module.exports = async (ctx) => {
    const { id, lang = '' } = ctx.params;
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-note/${id}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.content-title').text() || item.find('.description').text(),
                link: item.find('a.link-wrap').attr('href'),
                description: item.find('.description').text(),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('cite.name').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('footer').remove();
                item.description = $('article .content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
