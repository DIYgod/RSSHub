module.exports = (router) => {
    router.get('/cloud/column/:id?/:tag?', require('./cloud/column'));
    router.get('/pvp/newsindex/:type', require('./pvp/newsindex'));
    router.get('/qq/sdk/changelog/:platform', require('./qq/sdk/changelog'));
};
