const he = require('he');

module.exports = async (ctx, next) => {
    await next();

    // decode HTML entities
    if (ctx.state.data) {
        ctx.state.data.title && (ctx.state.data.title = he.decode(ctx.state.data.title));
        ctx.state.data.description && (ctx.state.data.description = he.decode(ctx.state.data.description));
        ctx.state.data.item &&
            ctx.state.data.item.forEach((item) => {
                item.title && (item.title = he.decode(item.title));
                item.description && (item.description = he.decode(item.description));
            });
    }

    // filter
    if (ctx.state.data && ctx.query && (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description || ctx.query.filter_author)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = item.title || '';
            const description = item.description || title;
            const author = item.author || '';
            return !(
                (ctx.query.filter && !title.match(ctx.query.filter) && !description.match(ctx.query.filter)) ||
                (ctx.query.filter_title && !title.match(ctx.query.filter_title)) ||
                (ctx.query.filter_description && !description.match(ctx.query.filter_description)) ||
                (ctx.query.filter_author && !author.match(ctx.query.filter_author))
            );
        });
    }
    if (ctx.state.data && ctx.query && (ctx.query.filterout || ctx.query.filterout_title || ctx.query.filterout_description || ctx.query.filterout_author)) {
        ctx.state.data.item = ctx.state.data.item.filter((item) => {
            const title = item.title;
            const description = item.description || title;
            const author = item.author || '';
            return (
                (ctx.query.filterout && !title.match(ctx.query.filterout) && !description.match(ctx.query.filterout)) ||
                (ctx.query.filterout_title && !title.match(ctx.query.filterout_title)) ||
                (ctx.query.filterout_description && !description.match(ctx.query.filterout_description)) ||
                (ctx.query.filterout_author && !author.match(ctx.query.filterout_author))
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
