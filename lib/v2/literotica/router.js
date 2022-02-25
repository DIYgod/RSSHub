module.exports = function (router) {
    router.get('/new', require('./new'));
    router.get('/category/:category', require('./category'));
};
