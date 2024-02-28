module.exports = (router) => {
    router.get('/sse/:type?', './sse/notice');
    router.get('/yjs', './yjs');
};
