module.exports = (router) => {
    router.get('/itnews/:channel', (ctx) => {
        const { channel } = ctx.req.param();
        const redirectTo = `/liulinblog/${channel}`;
        ctx.redirect(redirectTo);
    });
    router.get('/:params*', './');
};
