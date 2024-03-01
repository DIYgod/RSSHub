module.exports = function (router) {
    router.get('/news/:ticker', require('./quote'));
    router.get('/:category?', require('./news'));
};
