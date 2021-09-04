const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.sznews.com';

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();
    const currentUrl = `${rootUrl}/ranking/${today.getFullYear()}-${todayMonth < 10 ? `0${todayMonth}` : todayMonth}-${todayDate < 10 ? `0${todayDate}` : todayDate}.json`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.TITLE,
        link: item.URL,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    let detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const fulltext = detailResponse.data.match(/<a href="(.*)">全文阅读<\/a>/);

                    if (fulltext) {
                        item.link = fulltext[1];
                        detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                    }

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.article-content').html();
                    item.author = content('.a_source').text().replace('来源： ', '');
                    item.pubDate = Date.parse(content('.a_time').text());

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '焦点新闻 - 深圳新闻网',
        link: 'http://news.sznews.com',
        item: items,
    };
};
