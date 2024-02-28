module.exports = (router) => {
    router.get('/:filter*', (ctx) => {
        const { filter } = ctx.req.param();

        if (filter && !filter.includes('/') && !filter.includes(',')) {
            ctx.redirect(`/getitfree/category/${filter}`);
        } else {
            return './'(ctx);
        }
    });
};
