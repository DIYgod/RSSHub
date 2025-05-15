const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    0: '推荐',
    3: '时事日报',
    6: '时事专题',
    13: '备考技巧',
    12: '招考信息',
    4: '时事月报',
    10: '重要会议',
    11: '领导讲话',
    5: '时事周刊',
    8: '官网公告',
    7: '时事评论',
};

module.exports = async (ctx) => {
    const id = ctx.params.id || '';

    const rootUrl = 'https://www.ssydt.com';
    const currentUrl = `${rootUrl}/api/article/articles?product=ssydt&terminal=Browser&pageSize=20&articleTypeId=${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.results.map((item) => ({
        guid: item.id,
        title: item.title,
        link: `${rootUrl}/article/${item.id}`,
        pubDate: timezone(parseDate(item.gmtCreate), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.article-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[id === '' ? '0' : id]} - 时事一点通`,
        link: `${rootUrl}/article?type=${id}`,
        item: items,
    };
};
