const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { appsUrl } = require('../utils');

module.exports = async (ctx) => {
    const { id, lang = '' } = ctx.params;
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-card/${id}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const items = $('.qoo-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const name = item.find('.qoo-clearfix .name a');
            const author = name.eq(0).text();
            const pubDate = timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm:ss'), 8);
            item.find('a.icon, .qoo-clearfix, footer, article.qoo-comment-panel, div.slot').remove();
            item.find('.img-list').attr('data-target', '');
            return {
                title: `${author} ▶ ${name.eq(1).text()}`,
                description: item.html(),
                pubDate,
                author,
                guid: `qoo-app:apps:card:7675:${item.attr('data-id')}`,
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
