module.exports = function (router) {
    router.get('/category/:category', require('./category'));
    router.get('/collections/:collection', require('./collection'));
    router.get('/radios/:category?', require('./radio'));
    router.get('/tag/:tag/:category?', require('./tag'));
};
