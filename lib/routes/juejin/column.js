const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const detail = await got({
        method: 'get',
        url: `https://api.juejin.cn/content_api/v1/column/detail?column_id=${id}`,
    });
    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/column/articles_cursor',
        json: {
            column_id: id,
            limit: 20,
            cursor: '0',
            sort: 0,
        },
    });
    const { data } = response.data;
    const detailData = detail.data.data;
    const columnName = detailData && detailData.column_version && detailData.column_version.title;
    const resultItems = await util.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: `掘金专栏-${columnName}`,
        link: `https://juejin.cn/column/${id}`,
        description: `掘金专栏-${columnName}`,
        item: resultItems,
    };
};
