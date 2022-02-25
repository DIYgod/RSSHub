const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.nowcoder.com';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const order = ctx.params.order;

    const link = `https://www.nowcoder.com/discuss?type=${type}&order=${order}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const type_name = $('a.discuss-tab.selected').text();
    const order_name = $('li.selected a').text();

    const list = $('li.clearfix')
        .map(function () {
            const info = {
                title: $(this).find('div.discuss-main.clearfix a:first').text().trim().replace('\n', ' '),
                link: $(this).find('div.discuss-main.clearfix a[rel]').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title || 'tzgg';
            const itemUrl = new URL(info.link, host).href.replace(new RegExp('^(.*)[?](.*)$'), '$1');

            return ctx.cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);

                const date_value = $('span.post-time').text();

                const description = $('.nc-post-content').html();

                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: timezone(parseDate(date_value), +8),
                };
            });
        })
    );

    ctx.state.data = {
        title: `${type_name}${order_name}——牛客网讨论区`,
        link,
        item: out,
    };
};
