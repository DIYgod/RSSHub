module.exports = function (router) {
    router.get('/yjsy/news/:type', require('./yjsy/news'));
    router.get('/yzxc/tzgg', require('./yzxc/tzgg'));
};
