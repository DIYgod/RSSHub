const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'recommend';
    const time = ctx.params.time || '5';
    const sort = ctx.params.sort || '1';

    const rootUrl = 'http://blog.sciencenet.cn';
    const currentUrl = `${rootUrl}/blog.php?mod=${type}&type=list&op=${time}&ord=${sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    const list = $('tr td a[title]')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
                pubDate: new Date(item.next().text()).toUTCString(),
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
                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                item.author = content('.xs2').text();
                item.description = content('#blog_article').html();
                item.pubDate = new Date(content('.xg1').eq(5).text()).toUTCString();

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
