const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    1: '新闻',
    3: '公告',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '1';

    const rootUrl = 'https://gf-cn.sunborngame.com';
    const apiRootUrl = 'https://gfcn-webserver.sunborngame.com';
    const apiUrl = `${apiRootUrl}/website/news_list/${category}?page=0&limit=${ctx.query.limit ?? 50}`;
    const currentUrl = `${rootUrl}/News`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.list.map((item) => ({
        guid: item.Id,
        title: item.Title,
        link: `${rootUrl}/NewsInfo?id=${item.Id}`,
        pubDate: timezone(parseDate(item.Date), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/website/news/${item.guid}`,
                });

                item.description = detailResponse.data.data.Content.replace(/<img src="/g, '<img src="https://gf-cn.cdn.sunborngame.com/website/cms/');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[category]} - 少女前线 - 情报局`,
        link: currentUrl,
        item: items,
    };
};
