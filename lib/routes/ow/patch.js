const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://ow.blizzard.cn';
    const currentUrl = `${rootUrl}/action/article/patch?p=1&pageSize=10`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.data.list.map((item) => ({
        title: item.description,
        link: `${rootUrl}/article/news/${item.articleId}`,
        description: item.content,
        pubDate: new Date(item.publishTime).toUTCString(),
    }));

    ctx.state.data = {
        title: '《守望先锋》补丁说明',
        link: `${rootUrl}/game/patch-notes`,
        item: items,
    };
};
