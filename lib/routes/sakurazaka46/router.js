module.exports = function (router) {
    router.get('/blog/:id?/:page?', './blog');
    router.get('/news', './news');
};
