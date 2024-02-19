const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/usergames`);
    const $ = cheerio.load(response);

    const list = $('.steam-game')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                author: item.find('span').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.cover-image').prop('outerHTML') + $('.tab-container').html() + $('.swiper-wrapper').prop('outerHTML') + $('.postcontent').html();
                item.pubDate = $('.gamedb-release').length ? timezone(parseDate($('.gamedb-release').text().replaceAll(/[()]/g, '')), +8) : null;

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
