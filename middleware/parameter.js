module.exports = async (ctx, next) => {
    await next();

    // 对所有中文进行转码
    const encode = (str) => str.replace(/([\u4e00-\u9fa5])/g, (s) => encodeURIComponent(s));

    // filter
    if (ctx.state.data && ctx.query && (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = encode(item.title);
            const description = item.description ? encode(item.description) : title;
            return !(
                (ctx.query.filter && !title.match(encode(ctx.query.filter)) && !description.match(encode(ctx.query.filter))) ||
                (ctx.query.filter_title && !title.match(encode(ctx.query.filter_title))) ||
                (ctx.query.filter_description && !description.match(encode(ctx.query.filter_description)))
            );
        });
    }

    if (ctx.state.data && ctx.query && (ctx.query.filterout || ctx.query.filterout_title || ctx.query.filterout_description)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = encode(item.title);
            const description = item.description ? encode(item.description) : title;
            return (
                (ctx.query.filterout && !title.match(encode(ctx.query.filterout)) && !description.match(encode(ctx.query.filterout))) ||
                (ctx.query.filterout_title && !title.match(encode(ctx.query.filterout_title))) ||
                (ctx.query.filterout_description && !description.match(encode(ctx.query.filterout_description)))
            );
        });
    }

    // limit
    if (ctx.state.data && ctx.query && ctx.query.limit) {
        ctx.state.data.item = ctx.state.data.item.slice(0, parseInt(ctx.query.limit));
    }
};
