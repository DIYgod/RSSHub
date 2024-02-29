module.exports = function (router) {
    router.get('/forum/:fid', './forum');
    router.get('/rank/:type', './rank');
};
