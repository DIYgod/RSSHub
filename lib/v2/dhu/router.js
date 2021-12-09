module.exports = function (router) {
    router.get('/jiaowu/news/:type?', require('./jiaowu/news'));
};
