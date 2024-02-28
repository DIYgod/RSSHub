module.exports = function (router) {
    router.get('/list/:id', (ctx) => {
        const id = ctx.req.param('id');

        const redirectTo = `/jiemian${id ? `/lists/${id}` : ''}`;
        ctx.redirect(redirectTo);
    });
    router.get('/:category*', './lists');
};
