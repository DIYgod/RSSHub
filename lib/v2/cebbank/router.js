module.exports = function (router) {
    router.get('/quotation/all', './all');
    router.get('/quotation/history/:type', './history');
};
