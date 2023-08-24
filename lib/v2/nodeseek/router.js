module.exports = function (router) {
    router.get('/post/new', require('./post/new'));
    router.get('/categories/:category', require('./categories/new'));
};
