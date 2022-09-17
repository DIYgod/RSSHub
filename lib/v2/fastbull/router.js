module.exports = function (router) {
    router.get('/express-news', require('./express-news'));
    router.get('/news', require('./news'));
    router.get('/', require('./news'));
};
