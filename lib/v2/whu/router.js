module.exports = function (router) {
    router.get('/cs/:type', require('./cs'));
    router.get('/gs/:type?', require('./gs/index.js'));
    router.get('/news/:type*', require('./news'));
};
