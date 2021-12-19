const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const option = ctx.params.option ?? 'photos';
    const category = ctx.params.category ?? 'all';
    const keyword = ctx.params.keyword ?? '';
    const time = ctx.params.time ?? 'a';
    const order = ctx.params.order ?? 'mr';

    const currentUrl = `${rootUrl}/search/${option}${category !== 'all' ? `/${category}` : ''}${keyword ? `?search_query=${keyword}` : '?'}${time !== 'a' ? `&t=${time}` : ''}${order !== 'mr' ? `&o=${order}` : ''}`;

    ctx.state.data = await ProcessItems(ctx, currentUrl);
};
