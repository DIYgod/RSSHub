const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://news.zhibo8.cc/${ctx.params.caty}/more.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.articleList li')
        .slice(0, 30)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                title: a.text(),
                link: `http:${a.attr('href')}`,
                pubDate: new Date(item.find('span.postTime').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(res.data);

                item.description = content('div.content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('span.title_g').text()} - 直播吧`,
        link: currentUrl,
        item: items,
    };
};
