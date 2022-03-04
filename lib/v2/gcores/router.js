module.exports = function (router) {
    router.get('/category/:category', require('./category'));
    router.get('/top/:tag/:category?', require('./tag'));
};
