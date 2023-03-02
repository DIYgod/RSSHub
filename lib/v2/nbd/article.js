const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {
    const url = 'https://www.nbd.com.cn/columns/332';
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://www.nbd.com.cn',
        },
    });

    const $ = cheerio.load(response.data);
    const $list = $('li.u-news-title').slice(0, 15).get();
    const description = $('head title').text().trim();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).find('a').text().trim();
            const itemUrl = 'https:' + $(item).find('a').attr('href');

            const single = await ctx.cache.tryGet(itemUrl, async () => {
                const detail = await got({
                    method: 'get',
                    url: itemUrl,
                    headers: {
                        Referer: 'https://www.nbd.com.cn',
                    },
                });
                const $ = cheerio.load(detail.data);
                return {
                    title,
                    link: itemUrl,
                    pubDate: timezone(parseDate(detail.data.match(/"pubDate": "(.*)"/)[1]), +8),
                    description: $('div.g-article').html(),
                };
            });
            return single;
        })
    );

    ctx.state.data = {
        title: '重磅原创-每经网',
        link: url,
        item: resultItem,
        description,
    };
};
