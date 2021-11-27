module.exports = function (router) {
    router.get('/news/rank/:category?/:type?/:time?', require('./rank'));
};
