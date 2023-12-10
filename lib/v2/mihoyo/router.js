module.exports = function (router) {
    router.get('/bbs/img-ranking/:game/:routeParams?', require('./bbs/img-ranking'));
    router.get('/bbs/official/:gids/:type?/:page_size?/:last_id?', require('./bbs/official'));
    router.get('/sr/:location?/:category?', require('./sr/news'));
    router.get('/ys/:location?/:category?', require('./ys/news'));
};
