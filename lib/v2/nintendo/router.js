module.exports = (router) => {
    router.get('/direct', require('./direct'));
    router.get('/eshop/cn', require('./eshop-cn'));
    router.get('/eshop/hk', require('./eshop-hk'));
    router.get('/eshop/jp', require('./eshop-jp'));
    router.get('/eshop/us', require('./eshop-us'));
    router.get('/news', require('./news'));
    router.get('/news/china', require('./news-china'));
    router.get('/system-update', require('./system-update'));
};
