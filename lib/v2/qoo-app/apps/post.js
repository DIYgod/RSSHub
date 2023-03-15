const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { appsUrl, newsUrl, fixImg } = require('../utils');

module.exports = async (ctx) => {
    const { id, lang = '' } = ctx.params;
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-post/${id}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('.qoo-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                // description: item.find('.img-list').html() + item.find('.text-view').html(),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('cite.name').text(),
                postId: a.attr('href').split('/').pop(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(`${newsUrl}${lang ? `/${lang}` : ''}/wp-json/wp/v2/posts/${item.postId}`);
                const $ = cheerio.load(data.content.rendered, null, false);

                fixImg($);

                item.description = $.html();
                item.pubDate = parseDate(data.date_gmt);

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
