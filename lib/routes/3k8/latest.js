const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.3k8.com';
    const currentUrl = `${rootUrl}/post/new_100/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const list = $('ul.list-item li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                title: a.attr('title'),
                link: rootUrl + a.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });

                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                    item.pubDate = new Date(content('span.time').text() + ' GMT+8').toUTCString();
                    item.description = content('div.content-intro').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '爱Q生活网 - 最近更新',
        link: currentUrl,
        item: items,
    };
};
