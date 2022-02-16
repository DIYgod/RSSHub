const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'bqym';

    const rootUrl = 'http://www.mwm.net.cn';
    const currentUrl = `${rootUrl}/web/${category === 'bqym' ? `bqym?pagesize=${ctx.query.limit ?? 100}` : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.n_date').remove();

    let items = $('.n_title, .con1_text')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.mrt20').html();
                item.author = content('.mrl20')
                    .text()
                    .trim()
                    .replace(/作者：/, '');
                item.pubDate = parseDate(content('.date').eq(0).text(), 'YYYY年MM月DD日');

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
