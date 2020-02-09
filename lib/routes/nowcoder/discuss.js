const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

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
        .map(function() {
            const info = {
                title: $(this)
                    .find('div.discuss-main.clearfix a')
                    .text()
                    .trim()
                    .replace('\n', ' '),
                link: $(this)
                    .find('div.discuss-main.clearfix a[rel]')
                    .attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title || 'tzgg';
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const date_value = $('span.post-time')
                .text()
                .split('  ')[1];

            const description = $('.nc-post-content').html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date(date_value, 8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${type_name}${order_name}——牛客网讨论区`,
        link: link,
        item: out,
    };
};
