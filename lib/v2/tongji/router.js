module.exports = (router) => {
    router.get('/sse/:type?', require('./sse/notice'));
    router.get('/yjs', require('./yjs'));
    router.get('/bks', require('./bks'));
};
