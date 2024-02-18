const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { columnId } = ctx.params;
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/column/${columnId}`);
    const $ = cheerio.load(response);

    const list = $('.article-panel')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h4 a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                upvotes: item.find('.number-first').text(),
                comments: item.find('.number-last').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.single-post').html();
                item.author = $('.header-info > a').text();
                const pubDate = $('.header-info')
                    .contents()
                    .filter((_, el) => el.nodeType === 3)
                    .text()
                    .trim()
                    .match(/(\d{4}-\d{2}-\d{2})/)?.[0];
                item.pubDate = pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), +8) : null;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link,
        item: items,
    };
};
