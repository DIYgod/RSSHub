const { rootUrl, apiRootUrl, types, ProcessThreads } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const type = ctx.params.type ?? 'hot';
    const order = ctx.params.order ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const currentUrl = `${rootUrl}${id ? `/category/${id}` : ''}`;
    const apiUrl = `${apiRootUrl}/api${id ? `/tags/${id}/` : ''}threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    ctx.state.data = {
        title: `一亩三分地 - ${id}${types[type]}`,
        link: currentUrl,
        item: await ProcessThreads(ctx.cache.tryGet, apiUrl, order),
    };
};
