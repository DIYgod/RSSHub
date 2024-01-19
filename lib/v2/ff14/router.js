module.exports = (router) => {
    router.get('/global/:lang/:type?', require('./ff14-global'));
    router.get('/zh/:type?', require('./ff14-zh'));
    // Deprecated
    router.get('/ff14_global/:lang/:type?', require('./ff14-global'));
    router.get('/ff14_zh/:type?', require('./ff14-zh'));
};
