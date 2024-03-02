export default (router) => {
    router.get('/global/:lang/:type?', './ff14-global');
    router.get('/zh/:type?', './ff14-zh');
    // Deprecated
    router.get('/ff14_global/:lang/:type?', './ff14-global');
    router.get('/ff14_zh/:type?', './ff14-zh');
};
