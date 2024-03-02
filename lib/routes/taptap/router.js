export default (router) => {
    router.get('/changelog/:id/:lang?', './changelog');
    router.get('/review/:id/:order?/:lang?', './review');
    router.get('/topic/:id/:type?/:sort?/:lang?', './topic');
    // TapTap.io, the international website
    router.get('/intl/changelog/:id/:lang?', './changelog');
    router.get('/intl/review/:id/:order?/:lang?', './review');
};
