module.exports = function (router) {
    router.get('/bbs/official/:gids/:type?/:page_size?/:last_id?', require('./bbs'));
    router.get('/sr/:category?', require('./sr/news'));
    router.get('/ys/:location?/:category?', require('./ys/news'));
};
