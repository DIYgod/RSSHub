module.exports = (router) => {
    router.get('/:filter*', (ctx, next) => {
        const { filter } = ctx.params;

        if (filter && !filter.includes('/') && !filter.includes(',')) {
            ctx.redirect(`/getitfree/category/${filter}`);
        } else {
            return require('./')(ctx, next);
        }
    });
};
