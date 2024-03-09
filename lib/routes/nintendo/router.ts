export default (router) => {
    router.get('/direct', './direct');
    router.get('/eshop/cn', './eshop-cn');
    router.get('/eshop/hk', './eshop-hk');
    router.get('/eshop/jp', './eshop-jp');
    router.get('/eshop/us', './eshop-us');
    router.get('/news', './news');
    router.get('/news/china', './news-china');
    router.get('/system-update', './system-update');
};
