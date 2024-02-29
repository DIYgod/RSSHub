module.exports = function (router) {
    router.get('/news/:type?', './news');
};
