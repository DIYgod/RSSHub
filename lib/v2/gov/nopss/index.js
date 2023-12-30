const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.path === '/nopss' ? '/GB/219469' : ctx.path.replace(/^\/nopss/, '');

    const rootUrl = 'http://www.nopss.gov.cn';
    const currentUrl = `${rootUrl}${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    let items = $('.p2j_list_con .clearfix li a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 40)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(item.next().text(), '[YYYY-MM-DD HH:mm]'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                item.description = content('.text_con').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
