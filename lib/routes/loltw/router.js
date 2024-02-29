module.exports = function (router) {
    router.get('/news/:category?', './news');
};
