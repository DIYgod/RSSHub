module.exports = async (ctx, next) => {
    await next();

    if (ctx.state.data && ctx.query && (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = item.title;
            const description = item.description;
            return !(ctx.query.filter && !title.match(ctx.query.filter) && !description.match(ctx.query.filter)
                || ctx.query.filter_title && !title.match(ctx.query.filter_title)
                || ctx.query.filter_description && !description.match(ctx.query.filter_description));
        });
    }
};
