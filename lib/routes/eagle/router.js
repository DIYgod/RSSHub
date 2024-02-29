module.exports = function (router) {
    router.get('/blog/:cate?/:language?', './blog');
    router.get('/changelog/:language?', './changelog');
};
