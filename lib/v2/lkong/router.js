module.exports = function (router) {
    router.get('/forum/:id?/:digest?', './forum');
    router.get('/thread/:id', './thread');
};
