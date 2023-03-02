module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/apple/:id', require('./apple'));
};
