module.exports = function (router) {
    router.get('/news/:type?', require('./news'));
    router.get('/yjsy/:type', require('./yjsy'));
};
