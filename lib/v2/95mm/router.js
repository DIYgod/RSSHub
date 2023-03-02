module.exports = function (router) {
    router.get('/tab/:tab?', require('./tab'));
    router.get('/tag/:tag', require('./tag'));
    router.get('/category/:category', require('./category'));
};
