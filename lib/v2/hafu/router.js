module.exports = function (router) {
    router.get('/news/:type/:limit?', require('./news'));
};
