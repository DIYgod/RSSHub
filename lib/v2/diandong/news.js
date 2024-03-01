const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://webapi.diandong.com';

const titleMap = {
    0: '推荐',
    29: '新车',
    61: '导购',
    30: '试驾',
    75: '用车',
    22: '技术',
    24: '政策',
    23: '行业',
};

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? 0;
    const limit = ctx.query.limit ? Number(ctx.query.limit) : 25;
    const url = `${rootUrl}/content/list?page=1&size=${limit}&source_id=12&content_type=news&content_ids=&category_id=${cate}`;

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
        title: `电动邦 - ${titleMap[cate]}`,
        link: 'https://www.diandong.com/news',
        item: items,
    };
};
