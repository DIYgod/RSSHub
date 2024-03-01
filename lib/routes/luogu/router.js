export default (router) => {
    router.get('/contest', './contest');
    router.get('/daily/:id?', './daily');
    router.get('/user/feed/:uid', './user-feed');
    router.get('/user/blog/:name', './user-blog');
};
