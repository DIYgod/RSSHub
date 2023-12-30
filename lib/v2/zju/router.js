module.exports = (router) => {
    router.get('/career/:type', require('./career'));
    router.get('/cst/custom/:id', require('./cst/custom'));
    router.get('/cst/:type', require('./cst'));
    router.get('/grs/:type', require('./grs'));
    router.get('/list/:type', require('./list'));
    router.get('/physics/:type', require('./physics'));
};
