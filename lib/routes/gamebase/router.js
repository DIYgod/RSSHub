module.exports = function (router) {
    router.get('/news/:type?/:category?', './news');
};
