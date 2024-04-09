const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www2021.cbnweek.com';
    const apiRootUrl = 'https://api2021.cbnweek.com';
    const currentUrl = `${apiRootUrl}/v4/first_page_infos?per=1`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.map((item) => {
        const post = item.data[0];
        return {
            guid: post.id,
            title: post.title,
            link: `${rootUrl}/#/article_detail/${post.id}`,
            pubDate: parseDate(post.display_time),
            author: post.authors?.map((a) => a.name).join(', '),
            category: post.topics?.map((t) => t.name),
        };
    });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/v4/articles/${item.guid}`,
                });

                item.description = detailResponse.data.data.content;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '第一财经杂志',
        link: rootUrl,
        item: items,
    };
};
