module.exports = function (router) {
    router.get('/bs/:category?', require('./bs'));
    router.get('/dwxgb/:category/:type', require('./dwxgb'));
    router.get('/fdy/:path*', require('./fdy'));
    router.get('/lib/:category?', require('./lib'));
};
