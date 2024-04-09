module.exports = function (router) {
    router.get('/article', require('./article'));
    router.get('/column/:id', require('./column'));
    router.get('/news', require('./news'));
    router.get('/', require('./'));
};
