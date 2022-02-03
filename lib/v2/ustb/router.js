module.exports = function (router) {
    router.get('/news/:type?', require('./yjsy/news'));
};
