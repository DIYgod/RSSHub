export default (router) => {
    router.get('/bbs/follow-list/:uid', './bbs/follow-list');
    router.get('/bbs/img-ranking/:game/:routeParams?', './bbs/img-ranking');
    router.get('/bbs/official/:gids/:type?/:page_size?/:last_id?', './bbs/official');
    router.get('/bbs/timeline', './bbs/timeline');
    router.get('/bbs/user-post/:uid', './bbs/user-post');
    router.get('/sr/:location?/:category?', './sr/news');
    router.get('/ys/:location?/:category?', './ys/news');
};
