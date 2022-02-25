module.exports = function (router) {
    router.get('/gofans', require('./gofans'));
    router.get('/xianmian', require('./xianmian'));
    router.get('/iap/:country/:id', require('./in-app-purchase'));
    router.get('/price/:country/:type/:id', require('./price'));
    router.get('/update/:country/:id', require('./update'));
};
