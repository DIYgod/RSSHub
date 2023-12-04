const { rootUrl, apiRootUrl, types, ProcessThreads } = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'hot';
    const order = ctx.params.order ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const apiUrl = `${apiRootUrl}/api/threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    ctx.state.data = {
        title: `一亩三分地 - ${types[type]}`,
        link: rootUrl,
        item: await ProcessThreads(ctx.cache.tryGet, apiUrl, order),
    };
};
