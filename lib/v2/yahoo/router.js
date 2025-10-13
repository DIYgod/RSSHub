module.exports = function (router) {
    router.get('/news/en/:category?', require('./news/us/index'));
    router.get('/news/provider/:region/:providerId', require('./news/tw/provider'));
    router.get('/news/providers/:region', require('./news/tw/provider-helper'));
    router.get('/news/:region/:category?', require('./news/tw/index'));
};
