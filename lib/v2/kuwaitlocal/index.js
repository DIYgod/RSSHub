const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://kuwaitlocal.com';

module.exports = async (ctx) => {
    const { category = 'latest' } = ctx.params;
    const url = `${baseUrl}/news/${category === 'latest' ? category : `categories/${category}`}`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);
    const list = $('.news_list a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: baseUrl + item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.pubDate = parseDate($('.date_icon').next().text());
                $('[id^=div-gpt-ad], .pad_10_0, .hide_desktop').remove();
                item.description = $('.mob_pad_view').html();
                item.category = $('.news_tags a')
                    .toArray()
                    .map((item) => $(item).text());
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        description: $('head meta[name="description"]').attr('content').trim(),
        link: url,
        item: items,
        language: 'en',
    };
};
