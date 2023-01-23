module.exports = (router) => {
    router.get('/aggsite/topdiggs', require('./common'));
    router.get('/aggsite/topviews', require('./common'));
    router.get('/aggsite/headline', require('./common'));
    router.get('/cate/:type', require('./common'));
    router.get('/pick', require('./common'));
};
