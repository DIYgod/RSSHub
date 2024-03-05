const toZzkx = (ctx) => {
    // https://www.cs.com.cn/sylm/jsbd/

    const redirectTo = '/cs/sylm/jsbd';
    ctx.redirect(redirectTo);
};

export default (router) => {
    router.get('/news/zzkx', toZzkx);
    router.get('/zzkx', toZzkx);
    router.get('/video/:category?', './video');
    router.get('/:category*', './');
};
