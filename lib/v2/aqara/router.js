module.exports = function (router) {
    router.get('/cn/news', './news');
    router.get('/community/:id?/:keyword?', './community');
    router.get('/:region/:type?', (ctx) => {
        const types = {
            news: 'press-release',
            blog: 'article',
        };

        const { region = 'en', type = 'news' } = ctx.req.param();
        const redirectTo = `/aqara/${region}/category/${types[type]}`;
        ctx.redirect(redirectTo);
    });
    router.get(/([\w-/]+)?/, './post');
};
