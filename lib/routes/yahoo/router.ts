export default (router) => {
    router.get('/news/en/:category?', './news/us/index');
    router.get('/news/provider/:region/:providerId', './news/tw/provider');
    router.get('/news/providers/:region', './news/tw/provider-helper');
    router.get('/news/:region/:category?', './news/tw/index');
};
