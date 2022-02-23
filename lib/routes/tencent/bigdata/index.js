const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://bigdata.qq.com';
    const currentUrl = `${rootUrl}/reports`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.index-blog-list li div.content')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.article-title');
            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
                pubDate: new Date(item.find('div.date').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('#page-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '腾讯大数据',
        link: currentUrl,
        item: items,
    };
};
