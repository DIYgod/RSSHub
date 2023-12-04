const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { appsUrl } = require('../utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id, lang = '' } = ctx.params;
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-comment/${id}`;

    const { data: response } = await got(link, {
        searchParams: {
            sort: 'create',
        },
    });
    const $ = cheerio.load(response);

    const items = $('.qoo-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const author = item.find('.qoo-clearfix .name a').eq(0).text();
            return {
                title: `${author} ▶ ${item.find('.qoo-clearfix .name a').eq(1).text()}`,
                link: item.find('a.bg-click-wrap').attr('href'),
                description: art(path.join(__dirname, '../templates/comment.art'), {
                    rating: item.find('.qoo-rating-bar').text().trim(),
                    text: item.find('.text-view').html(),
                }),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm:ss'), 8),
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
