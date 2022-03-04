const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.mingjian.cn/';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.col-md-3')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                link: a.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.title = content('div.title').eq(0).text();
                item.description = content('div.content').html();
                item.pubDate = new Date(content('div.date').eq(0).text().replace('发表于', '') + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '消费明鉴 - 最新新闻',
        link: currentUrl,
        item: items,
    };
};
