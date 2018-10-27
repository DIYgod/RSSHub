module.exports = async (ctx, next) => {
    await next();

    // filter
    if (ctx.state.data && ctx.query && (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = item.title;
            const description = item.description || title;
            return !(
                (ctx.query.filter && !title.match(ctx.query.filter) && !description.match(ctx.query.filter)) ||
                (ctx.query.filter_title && !title.match(ctx.query.filter_title)) ||
                (ctx.query.filter_description && !description.match(ctx.query.filter_description))
            );
        });
    }
    if (ctx.state.data && ctx.query && (ctx.query.filterout || ctx.query.filterout_title || ctx.query.filterout_description)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = item.title;
            const description = item.description || title;
            return (
                (ctx.query.filterout && !title.match(ctx.query.filterout) && !description.match(ctx.query.filterout)) ||
                (ctx.query.filterout_title && !title.match(ctx.query.filterout_title)) ||
                (ctx.query.filterout_description && !description.match(ctx.query.filterout_description))
            );
        });
    }

    // limit
    if (ctx.state.data && ctx.query && ctx.query.limit) {
        ctx.state.data.item = ctx.state.data.item.slice(0, parseInt(ctx.query.limit));
    }

    // telegram instant view
    if (ctx.state.data && ctx.query && ctx.query.tgiv) {
        ctx.state.data.item.map((item) => {
            const encodedlink = encodeURIComponent(item.link);
            item.link = `https://t.me/iv?url=${encodedlink}&rhash=${ctx.query.tgiv}`;
            return item;
        });
    }
};
