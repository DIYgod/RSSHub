module.exports = function (router) {
    router.get('/bgw/:code', require('./bgw'));
    router.get('/dean/:code', require('./dean'));
    router.get('/scs/:code', require('./scs'));
    router.get('/dxy/:code', require('./dxy'));
};
