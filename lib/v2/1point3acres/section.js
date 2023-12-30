const { rootUrl, apiRootUrl, types, ProcessThreads } = require('./utils');

const sections = {
    257: '留学申请',
    379: '世界公民',
    400: '投资理财',
    31: '生活干货',
    345: '职场达人',
    391: '人际关系',
    38: '海外求职',
    265: '签证移民',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const type = ctx.params.type ?? 'hot';
    const order = ctx.params.order ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const currentUrl = `${rootUrl}${id ? (isNaN(id) ? `/category/${id}` : `/section/${id}`) : ''}`;
    const apiUrl = `${apiRootUrl}/api${id ? (isNaN(id) ? `/tags/${id}/` : `/forums/${id}/`) : ''}threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    ctx.state.data = {
        title: `一亩三分地 - ${sections.hasOwnProperty(id) ? sections[id] : id}${types[type]}`,
        link: currentUrl,
        item: await ProcessThreads(ctx.cache.tryGet, apiUrl, order),
    };
};
