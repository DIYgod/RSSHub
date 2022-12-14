module.exports = function (router) {
    router.get('/gix/news/:category', require('./gix/news'));
};
