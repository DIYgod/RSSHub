const cheerio = require('cheerio');

module.exports = async (ctx, next) => {
    await next();

    if (ctx.body && ctx.query && (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description)) {
        const $ = cheerio.load(ctx.body, {
            xmlMode: true
        });
        $('item').filter((index, item) => {
            const title = $(item).find('title').text();
            const description = $(item).find('description').text();
            return ctx.query.filter && !title.match(ctx.query.filter) && !description.match(ctx.query.filter)
                || ctx.query.filter_title && !title.match(ctx.query.filter_title)
                || ctx.query.filter_description && !description.match(ctx.query.filter_description);
        }).remove();

        ctx.body = $.xml();
    }
};
