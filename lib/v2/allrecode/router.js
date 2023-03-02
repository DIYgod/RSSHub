module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/:category?', require('./index'));
};
