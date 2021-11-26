const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'https://wap.3k8.com';
    const response = await got({
        method: 'get',
        url: rootUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const list = $('div.one-img-plc')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                link: rootUrl + item.find('a').attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                item.title = content('h1.title').text();
                item.pubDate = new Date(content('div.news-mes span').eq(0).text().replace('发布时间：', '').trim() + ' GMT+8').toUTCString();
                item.description = content('div.news-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '爱Q生活网 - 最近更新',
        link: rootUrl,
        item: items,
    };
};
