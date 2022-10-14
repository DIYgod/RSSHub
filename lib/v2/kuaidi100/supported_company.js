const utils = require('./utils');

module.exports = async (ctx) => {
    const ls = await utils.company(ctx);
    ctx.state.data = {
        title: `快递100 快递列表`,
        link: 'https://www.kuaidi100.com',
        description: `快递100 所支持的快递列表及其查询名称`,
        item: ls.map((item) => ({
            title: item.name,
            description: item.number,
            category: item.comTypeName,
            link: item.siteUrl,
        })),
    };
};
