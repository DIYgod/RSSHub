module.exports = (router) => {
    router.get('/aia/news', require('./aia/news'));
    router.get('/aia/notice/:type?', require('./aia/notice'));
    router.get('/auto/news', require('./aia/news'));
    router.get('/auto/notice/:type?', require('./aia/notice'));
    router.get('/yjs', require('./yjs'));
};
