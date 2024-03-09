export default (router) => {
    router.get('/jwc/news', './jwc/news');
    router.get('/jwc/notice/:category?', './jwc/notice');
    router.get('/jwc/school/:category?', './jwc/school');
    router.get('/scet/notice', './scet/notice');
    router.get('/seie/news_center', './seie/news-ccenter');
    router.get('/smae/:category?', './smae/notice');
    router.get('/yjs', './yjs');
};
