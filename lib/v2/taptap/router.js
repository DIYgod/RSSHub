module.exports = (router) => {
    router.get('/changelog/:id/:lang?', require('./changelog'));
    router.get('/review/:id/:order?/:lang?', require('./review'));
    router.get('/topic/:id/:type?/:sort?/:lang?', require('./topic'));
    // TapTap.io, the international website
    router.get('/intl/changelog/:id/:lang?', require('./changelog'));
    router.get('/intl/review/:id/:order?/:lang?', require('./review'));
};
