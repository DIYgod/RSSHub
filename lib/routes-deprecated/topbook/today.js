const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://topbook.cc';
    const currentUrl = `${rootUrl}/webapi/content/article/24/page?start=0&limit=24`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.items.map((item) => ({
        title: item.title,
        pubDate: Date.parse(item.createTime),
        link: `${rootUrl}/webapi/content/article/query/${item.articleId}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
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
        title: '今天看点啥 - Topbook',
        link: `${rootUrl}/overview/24`,
        item: items,
    };
};
