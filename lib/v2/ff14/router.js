module.exports = (router) => {
    router.get('/global/:lang/:type?', require('./ff14_global'));
    router.get('/zh/:type?', require('./ff14_zh'));
    // Deprecated
    router.get('/ff14_global/:lang/:type?', require('./ff14_global'));
    router.get('/ff14_zh/:type?', require('./ff14_zh'));
};
