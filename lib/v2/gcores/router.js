module.exports = function (router) {
    router.get('/category/:category', require('./category'));
    router.get('/radios/:category?', require('./radio'));
    router.get('/tag/:tag/:category?', require('./tag'));
    router.get('/collections/:collection/:category?', require('./collection'));
};
