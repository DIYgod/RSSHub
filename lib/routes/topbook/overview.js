const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id || '24';

    const rootUrl = 'https://topbook.cc';
    const categoryUrl = `${rootUrl}/webapi/content/category/${id}/query`;
    const currentUrl = `${rootUrl}/webapi/content/article/${id}/page?start=0&limit=24`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const categoryResponse = await got({
        method: 'get',
        url: categoryUrl,
    });

    const list = response.data.data.items.map((item) => ({
        title: item.title,
        pubDate: Date.parse(item.createTime),
        link: `${rootUrl}/webapi/content/article/query/${item.articleId}`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    item.author = detailResponse.data.data.nickname;
                    item.description = detailResponse.data.data.content;
                    item.link = `${rootUrl}/overview?selectedArticle=${item.link.split('/query/')[1]}`;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${categoryResponse.data.data.name} - Topbook`,
        link: `${rootUrl}/overview/${id}`,
        item: items,
    };
};
