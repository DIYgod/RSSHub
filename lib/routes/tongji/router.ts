export default (router) => {
    router.get('/bks', './bks');
    router.get('/sse/:type?', './sse/notice');
    router.get('/yjs', './yjs');
};
