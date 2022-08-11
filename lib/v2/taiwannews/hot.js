const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://www.taiwannews.com.tw';

module.exports = async (ctx) => {
    const { lang = 'en' } = ctx.params;
    const url = `${baseUrl}/${lang}/index`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const list = $('.mod_group-columns  .container-fluid .row')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('.entry-date span').eq(1).text(), 'YYYY/MM/DD HH:mm'), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.author = $('.article-author').text();
                item.category = $('.tagcloud a')
                    .toArray()
                    .map((a) => $(a).attr('title'));

                $('.article-head-wrapper, div[id^=div-gpt-ad-], div[class^=hidden-], footer').remove();
                $('.container-fluid').eq(2).remove();

                item.description = $('.mod_single-column').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.categories').eq(0).text()} - ${$('head title').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
        language: lang,
    };
};
