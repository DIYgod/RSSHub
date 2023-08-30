const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'aall';

    let rootUrl;

    if (/^\d+$/.test(id)) {
        rootUrl = `https://www.cna.com.tw/topic/newstopic/${id}.aspx`;
    } else {
        rootUrl = `https://www.cna.com.tw/list/${id}.aspx`;
    }
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.mainList li a div h2')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.parents('a').attr('href'),
                pubDate: timezone(parseDate(item.next().text()), +8),
            };
        });

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
