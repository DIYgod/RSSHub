module.exports = function (router) {
    router.get('/ccfcv/:channel/:category', require('./ccfcv/index'));
    router.get('/news/:category?', require('./news'));
    router.get('/tfbd/:caty/:id', require('./tfbd/index'));
};
