module.exports = (router) => {
    router.get('/gushitong/index', require('./gushitong'));
    router.get('/tieba/forum/good/:kw/:cid?/:sortBy?', require('./tieba/forum'));
    router.get('/tieba/forum/:kw/:sortBy?', require('./tieba/forum'));
    router.get('/tieba/post/:id', require('./tieba/post'));
    router.get('/tieba/post/lz/:id', require('./tieba/post'));
    router.get('/tieba/search/:qw/:routeParams?', require('./tieba/search'));
    router.get('/tieba/user/:uid', require('./tieba/user'));
    router.get('/top/:board?', require('./top'));
};
