module.exports = function (router) {
    router.get('/jiaowu/news/:type?', require('./jiaowu/news'));
    router.get('/news/xsxx', require('./news/xsxx'));
    router.get('/xxgk/news', require('./xxgk/news'));
    router.get('/yjs/zs/:type?', require('./yjs/zs'));
};
