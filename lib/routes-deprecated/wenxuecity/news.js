const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.wenxuecity.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('div.mainwrap div.block div.wrapper ul li a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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
                    headers: {
                        Referer: currentUrl,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('#articleContent').html();
                item.pubDate = new Date(content('time[itemprop="datePublished"]').text() + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '焦点新闻 - 文学城',
        link: currentUrl,
        item: items,
    };
};
