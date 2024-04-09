module.exports = function (router) {
    router.get('/list/:id', (ctx) => {
        const { id } = ctx.params;

        const redirectTo = `/jiemian${id ? `/lists/${id}` : ''}`;
        ctx.redirect(redirectTo);
    });
    router.get('/:category*', require('./lists'));
};
