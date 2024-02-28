module.exports = function (router) {
    router.get('/bs/:category?', './bs');
    router.get('/dwxgb/:category/:type', './dwxgb');
    router.get('/fdy/:path*', './fdy');
    router.get('/lib/:category?', './lib');
};
