module.exports = function (router) {
    router.get('/news/:type?/:category?', require('./news'));
};
