module.exports = function (router) {
    router.get('/bgw/:code', require('./bgw'));
    router.get('/dean/:code', require('./dean'));
    router.get('/dxy/:code', require('./dxy'));
    router.get('/scs/:code', require('./scs'));
    router.get('/cjxy/:code', require('./cjxy'));
    router.get('/is/:code', require('./is'));
};
