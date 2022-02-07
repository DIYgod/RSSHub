module.exports = function (router) {
    router.get('/yjsy/news/:type', require('./yjsy/news'));
};
