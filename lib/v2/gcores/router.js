module.exports = function (router) {
    router.get('/category/:category', require('./category'));
    router.get('/tag/:tag/:category?', require('./tag'));
};
