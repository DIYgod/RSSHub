module.exports = function (router) {
    router.get('/news', './news');
    router.get('/blog/:id?', './blog');
};
