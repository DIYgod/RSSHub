const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '新闻';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const rootUrl = 'http://www.aliresearch.com';
    const currentUrl = `${rootUrl}/cn/information`;
    const apiUrl = `${rootUrl}/ch/listArticle`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            pageNo: 1,
            pageSize: 10,
            type,
        },
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.articleCode,
        author: item.author,
        pubDate: timezone(parseDate(item.gmtCreated), +8),
        link: `${rootUrl}/ch/information/informationdetails?articleCode=${item.articleCode}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${rootUrl}/ch/getArticle`,
                    json: {
                        articleCode: item.title,
                    },
                });

                const data = detailResponse.data.data;

                item.title = data.title;
                item.description = data.content;
                item.category = data.special.split(',');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `阿里研究院 - ${type}`,
        link: currentUrl,
        item: items,
    };
};
