module.exports = function (router) {
    router.get('/cn/news', require('./news'));
    router.get('/community/:id?/:keyword?', require('./community'));
    router.get('/:region/:type?', (ctx) => {
        const types = {
            news: 'press-release',
            blog: 'article',
        };

        const { region = 'en', type = 'news' } = ctx.params;
        const redirectTo = `/aqara/${region}/category/${types[type]}`;
        ctx.redirect(redirectTo);
    });
    router.get(/([\w-/]+)?/, require('./post'));
};
