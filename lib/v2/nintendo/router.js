module.exports = (router) => {
    router.get('/direct', require('./direct'));
    router.get('/eshop/cn', require('./eshop_cn'));
    router.get('/eshop/hk', require('./eshop_hk'));
    router.get('/eshop/jp', require('./eshop_jp'));
    router.get('/eshop/us', require('./eshop_us'));
    router.get('/news', require('./news'));
    router.get('/news/china', require('./news_china'));
    router.get('/system-update', require('./system-update'));
};
