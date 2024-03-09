export default (router) => {
    router.get('/gushitong/index', './gushitong');
    router.get('/search/:keyword', './search');
    router.get('/tieba/forum/good/:kw/:cid?/:sortBy?', './tieba/forum');
    router.get('/tieba/forum/:kw/:sortBy?', './tieba/forum');
    router.get('/tieba/post/:id', './tieba/post');
    router.get('/tieba/post/lz/:id', './tieba/post');
    router.get('/tieba/search/:qw/:routeParams?', './tieba/search');
    router.get('/tieba/user/:uid', './tieba/user');
    router.get('/top/:board?', './top');
};
