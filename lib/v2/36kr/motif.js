const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://36kr.com';
    const currentUrl = `${rootUrl}/motif/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/"motifDetailData":{"code":0,"data":(.*)},"channel"/)[1]);

    const items = data.motifArticleList.data.itemList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `${rootUrl}/p/${item.itemId}`,
        pubDate: parseDate(item.templateMaterial.publishTime),
        description: `<p>${item.templateMaterial.content}</p>`,
    }));

    ctx.state.data = {
        title: `36kr - ${data.motifInfo.data.categoryTitle}`,
        link: currentUrl,
        item: items,
    };
};
