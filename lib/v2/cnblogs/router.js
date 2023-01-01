module.exports = (router) => {
    router.get('/aggsite/topdiggs', require('./topdiggs'));
    router.get('/aggsite/topviews', require('./topviews'));
    router.get('/aggsite/headline', require('./headline'));
    router.get('/cate/:type', require('./cate'));
    router.get('/pick', require('./pick'));
};
