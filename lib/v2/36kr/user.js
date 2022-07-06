const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://36kr.com';
    const apiRootUrl = 'https://gateway.36kr.com';
    const currentUrl = `${rootUrl}/user/${id}`;

    const infoResponse = await got({
        method: 'post',
        url: `${apiRootUrl}/api/mis/user/info`,
        json: {
            param: {
                userId: id,
                siteId: 1,
                platformId: 2,
            },
            platformId: 2,
            siteId: 1,
            userId: id,
            partner_id: 'web',
        },
    });

    const response = await got({
        method: 'post',
        url: `${apiRootUrl}/api/mis/me/article`,
        json: {
            param: {
                userId: id,
                pageEvent: 0,
                pageSize: 20,
                pageCallback: '',
                siteId: 1,
                platformId: 2,
            },
            pageCallback: '',
            pageEvent: 0,
            pageSize: 20,
            platformId: 2,
            siteId: 1,
            userId: id,
            partner_id: 'web',
        },
    });

    const items = response.data.data.itemList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `${rootUrl}/p/${item.itemId}`,
        pubDate: parseDate(item.templateMaterial.publishTime),
        description: `<p>${item.templateMaterial.widgetContent}</p>`,
    }));

    ctx.state.data = {
        title: `36kr - ${infoResponse.data.data.userNick}`,
        link: currentUrl,
        item: items,
    };
};
