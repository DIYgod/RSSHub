export default (router) => {
    router.get('/news/author/:mid', './news/author');
    router.get('/news/coronavirus/data/:province?/:city?', './news/coronavirus/data');
    router.get('/news/coronavirus/total', './news/coronavirus/total');
    router.get('/pvp/newsindex/:type', './pvp/newsindex');
    router.get('/qq/sdk/changelog/:platform', './qq/sdk/changelog');
};
