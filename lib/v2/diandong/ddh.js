const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://webapi.diandong.com';

const titleMap = {
    0: '全部',
    1: '新车',
    2: '导购',
    3: '评测',
    4: '新闻',
    5: '技术',
    6: '政策',
    7: '用车',
    8: '二手车',
};

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? 0;
    const limit = ctx.query.limit ? Number(ctx.query.limit) : 25;
    const url = `${rootUrl}/content/ddhList?category_id=${cate}&page=1&size=${limit}&content_ids=`;

    const response = await got(url);
    const data = response.data.data.list;
    const list = data.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.published),
        author: item.author,
        link: `https://www.diandong.com/news/${item.contentid}.html`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);

                item.description = $('#gallery-selector').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `电动邦 - 电动号 - ${titleMap[cate]}`,
        link: 'https://www.diandong.com/news/ddh',
        item: items,
    };
};
