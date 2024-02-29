module.exports = function (router) {
    router.get('/news/:category?/:id?', './news');
};
