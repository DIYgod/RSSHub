const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.36kr.com';
    const currentUrl = `${rootUrl}/search/articles/${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = JSON.parse(response.data.match(/"itemList":(.*),"pageCallback"/)[1]).map((item) => ({
        title: item.widgetTitle.replace(/<\/?em>/g, ''),
        link: `${rootUrl}/p/${item.itemId}`,
        description: `<p>${item.content}</p>`,
        pubDate: parseDate(item.publishTime),
    }));

    ctx.state.data = {
        title: `36氪 - ${keyword}相关文章`,
        link: currentUrl,
        item: items,
    };
};
