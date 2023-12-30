module.exports = function (router) {
    router.get('/bgw/:code', require('./bgw'));
    router.get('/cjxy/:code', require('./cjxy'));
    router.get('/dean/:code', require('./dean'));
    router.get('/dxy/:code', require('./dxy'));
    router.get('/is/:code', require('./is'));
    router.get('/scs/:code', require('./scs'));
};
