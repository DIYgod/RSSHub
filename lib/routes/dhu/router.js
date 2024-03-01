export default (router) => {
    router.get('/jiaowu/news/:type?', './jiaowu/news');
    router.get('/news/xsxx', './news/xsxx');
    router.get('/xxgk/news', './xxgk/news');
    router.get('/yjs/news/:type?', './yjs/news');
    router.get('/yjs/zs/:type?', './yjs/zs');
};
