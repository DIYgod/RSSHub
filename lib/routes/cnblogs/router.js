export default (router) => {
    router.get('/aggsite/topdiggs', './common');
    router.get('/aggsite/topviews', './common');
    router.get('/aggsite/headline', './common');
    router.get('/cate/:type', './common');
    router.get('/pick', './common');
};
