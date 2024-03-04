export default (router) => {
    router.get('/aia/news', './aia/news');
    router.get('/aia/notice/:type?', './aia/notice');
    router.get('/auto/news', './aia/news');
    router.get('/auto/notice/:type?', './aia/notice');
    router.get('/yjs', './yjs');
};
