module.exports = (router) => {
    router.get('/itnews/:channel', (ctx) => {
        const { channel } = ctx.params;
        const redirectTo = `/liulinblog/${channel}`;
        ctx.redirect(redirectTo);
    });
    router.get('/:params*', require('./'));
};
