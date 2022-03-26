const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'allnews';

    let query;

    if (ctx.params.caty === 'hd') {
        query = 'div.article_list article div h3 a';
    } else {
        query = 'div.article_list ul li a';
    }

    const rootUrl = 'https://jx3.xoyo.com';
    const currentUrl = `${rootUrl}/${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(query)
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(rootUrl, item.attr('href')),
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

                item.description = content('div.detail_con').html();
                item.pubDate = new Date(content('p.detail_time').text() + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('ul.allnews_list_ul li.active').text()} - 剑网3`,
        link: currentUrl,
        item: items,
    };
};
