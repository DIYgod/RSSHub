module.exports = function (router) {
    router.get('/apps/update/:country/:id/:platform?', './apps');
    router.get('/exchange_repair/:country?', './exchange-repair');
};
