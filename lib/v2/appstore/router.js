module.exports = function (router) {
    router.get('/xianmian', require('./xianmian'));
    router.get('/iap/:country/:id', require('./in-app-purchase'));
    router.get('/price/:country/:type/:id', require('./price'));
};
