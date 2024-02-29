module.exports = function (router) {
    router.get('/blog/:maxPage?', './blog');
};
