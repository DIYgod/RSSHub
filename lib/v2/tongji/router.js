module.exports = (router) => {
    router.get('/bks', require('./bks'));
    router.get('/sse/:type?', require('./sse/notice'));
    router.get('/yjs', require('./yjs'));
};
