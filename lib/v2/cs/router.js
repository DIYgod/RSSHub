const toZzkx = (ctx) => {
    // https://www.cs.com.cn/sylm/jsbd/

    const redirectTo = '/cs/sylm/jsbd';
    ctx.redirect(redirectTo);
};

module.exports = (router) => {
    router.get('/news/zzkx', toZzkx);
    router.get('/zzkx', toZzkx);
    router.get('/video/:category?', require('./video'));
    router.get('/:category*', require('./'));
};
