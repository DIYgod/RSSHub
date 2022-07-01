module.exports = function (router) {
    router.get('/live/:category?/:score?', require('./live'));
    router.get('/news/:category?', require('./news'));
    router.get('/:category?', require('./news'));
};
