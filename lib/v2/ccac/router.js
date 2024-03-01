module.exports = function (router) {
    router.get('/news/:type/:lang?', require('./news'));
};
