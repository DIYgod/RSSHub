module.exports = function (router) {
    router.get('/live/:category?', require('./live'));
    router.get('/news/:category?', require('./news'));
    router.get('/:category?', require('./news'));
};
