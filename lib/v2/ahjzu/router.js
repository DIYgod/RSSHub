module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/yjsc/:type', require('./yjsc'));
};
