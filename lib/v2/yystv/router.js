module.exports = function (router) {
    router.get('/category/:category', require('./category'));
    router.get('/docs', require('./docs'));
};
