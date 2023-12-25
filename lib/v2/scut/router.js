module.exports = (router) => {
    router.get('/jwc/news', require('./jwc/news'));
    router.get('/jwc/notice/:category?', require('./jwc/notice'));
    router.get('/jwc/school/:category?', require('./jwc/school'));
    router.get('/scet/notice', require('./scet/notice'));
    router.get('/seie/news_center', require('./seie/news_center'));
    router.get('/smae/:category?', require('./smae/notice'));
    router.get('/yjs', require('./yjs'));
};
