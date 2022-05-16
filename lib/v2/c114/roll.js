const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.c114.com.cn';
    const currentUrl = `${rootUrl}/news/roll.asp`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    let items = $('.new_list_c h6 a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('.text').html();
                item.author = content('.author').first().text().replace('C114通信网 &nbsp;', '');
                item.pubDate = timezone(parseDate(content('.r_time').text()), +8);
                item.category = content('meta[name="keywords"]').attr('content').split(',');

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
