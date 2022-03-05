module.exports = function (router) {
    router.get('/exchange_repair/:country?', require('./exchange_repair'));
};
