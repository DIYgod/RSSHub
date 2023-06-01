module.exports = function (router) {
    router.get('/news/:type?', require('./news'));
    router.get('/yjsb/:type', require('./yjsb'));
};
