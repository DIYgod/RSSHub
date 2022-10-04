module.exports = function (router) {
    router.get('/bgw/:code', require('./bgw'));
    router.get('/dean/:code', require('./dean'));
    router.get('/dxy/:code', require('./dxy'));
    router.get('/scs/:code', require('./scs'));
};
