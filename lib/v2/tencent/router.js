module.exports = (router) => {
    router.get('/cloud/column/:id?/:tag?', require('./cloud/column'));
    router.get('/news/coronavirus/data/:province?/:city?', require('./news/coronavirus/data'));
    router.get('/news/coronavirus/total', require('./news/coronavirus/total'));
    router.get('/pvp/newsindex/:type', require('./pvp/newsindex'));
    router.get('/qq/sdk/changelog/:platform', require('./qq/sdk/changelog'));
};
