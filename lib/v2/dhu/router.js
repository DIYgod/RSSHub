module.exports = function (router) {
    router.get('/jiaowu/news/:type?', require('./jiaowu/news'));
    router.get('/xxgk/news', require('./xxgk/news'));
    router.get('/yjs/zs/:type?', require('./yjs/zs'));
};
