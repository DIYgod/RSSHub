const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { platform = 'all' } = ctx.params;
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/gamedb/recent/${platform}/p/1`);
    const $ = cheerio.load(response);

    const list = $('.related-game')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item
                    .find('span')
                    .contents()
                    .filter((_, el) => el.nodeType === 3)
                    .text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const featureBox = $('.feature-box');
                if (featureBox.length) {
                    item.description = featureBox.find('p').first().text();
                    return item;
                }

                const article = $('.row article');
                article.find('#showHiddenText').remove();

                item.description = $('.cover-image').prop('outerHTML') + $('.tab-container').html() + article.html();
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
