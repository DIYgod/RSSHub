module.exports = function (router) {
    router.get('/apps/update/:country/:id', require('./apps'));
    router.get('/exchange_repair/:country?', require('./exchange_repair'));
};
