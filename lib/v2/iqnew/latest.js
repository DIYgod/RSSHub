const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.iqnew.com';
    const url = rootUrl + '/post/new_100/';
    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const list = $('.page-main-list .list-item a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: rootUrl + item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                item.title = content('.main-article .title').text();
                item.pubDate = timezone(parseDate(content('.time').eq(0).text()), 8);
                item.description = content('.content-intro').html();
                item.author = content('.author a').text();
                item.category = content('.keyword > a')
                    .toArray()
                    .map((item) => $(item).text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '爱Q生活网 - 最近更新',
        link: url,
        item: items,
    };
};
