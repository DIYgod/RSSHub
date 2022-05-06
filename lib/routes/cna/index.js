const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || 'aall';

    let rootUrl;

    if (/^\d+$/.test(ctx.params.id)) {
        rootUrl = `https://www.cna.com.tw/topic/newstopic/${ctx.params.id}.aspx`;
    } else {
        rootUrl = `https://www.cna.com.tw/list/${ctx.params.id}.aspx`;
    }
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('#jsMainList li a div h2')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.parents('a').attr('href'),
                pubDate: new Date(item.next().text() + ' GMT+8').toUTCString(),
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
                const topImage = content('.fullPic').html();

                item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
