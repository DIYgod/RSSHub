const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.tahui.com/';
    const currentUrl = 'https://www.tahui.com/rptlist';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('article.excerpt h2')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a').eq(0);
            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
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

                item.pubDate = new Date(content('div.meta span').eq(0).text().trim().replace(/\n/g, '')).toUTCString();
                item.description = content('div.artcontent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '它惠网 - 线报',
        link: currentUrl,
        item: items,
    };
};
