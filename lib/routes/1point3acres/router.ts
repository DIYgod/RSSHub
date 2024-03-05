export default (router) => {
    router.get('/blog/:category?', './blog');
    router.get('/category/:id?/:type?/:order?', './category');
    router.get('/offer/:year?/:major?/:school?', './offer');
    router.get('/post/:type?/:order?', './thread');
    router.get('/section/:id?/:type?/:order?', './section');
    router.get('/thread/:type?/:order?', './thread');
    router.get('/user/:id/posts', './user/post');
    router.get('/user/:id/threads', './user/thread');
};
