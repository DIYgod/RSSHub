module.exports = function (router) {
    router.get('/quotation/all', require('./all'));
    router.get('/quotation/history/:type', require('./history'));
};
