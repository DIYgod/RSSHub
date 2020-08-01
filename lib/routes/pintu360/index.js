const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || '0';

    const response = await got({
        method: 'post',
        url: 'https://www.pintu360.com/service/ajax_article_service.php',
        headers: {
            Referer: 'https://www.pintu360.com/',
        },
        form: {
            fnName: 'getArticleList',
            type: type === '0' ? 'recommend' : 'classId',
            id: type,
            pageNumber: 0,
            duration: 'quarter',
        },
    });
    const data = response.data;

    const items = await Promise.all(
        data.slice(0, 10).map(async (item) => {
            const link = `https://www.pintu360.com/a${item.id}.html?${item.op}`;
            return Promise.resolve({
                title: item.title,
                description: await ctx.cache.tryGet(link, async () => {
                    const res = await got(link);
                    const $ = cheerio.load(res.data);
                    return $('.article-content .text').html();
                }),
                pubDate: new Date(item.createTime).toUTCString(),
                link,
            });
        })
    );

    const titleMap = {
        '0': '推荐',
        '7': '零售前沿',
        '10': '智能科技',
        '9': '泛文娱',
        '98': '教育',
        '70': '大健康',
        '8': '新消费',
        '72': '创业投资',
    };
    ctx.state.data = {
        title: `品途商业评论-${titleMap[type]}`,
        link: type === '0' ? 'https://www.pintu360.com/' : `https://www.pintu360.com/articleList-${type}.html`,
        item: items,
    };
};
