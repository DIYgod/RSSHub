module.exports = function (router) {
    router.get('/blog/:category?', require('./blog'));
    router.get('/category/:id?/:type?/:order?', require('./category'));
    router.get('/offer/:year?/:major?/:school?', require('./offer'));
    router.get('/post/:type?/:order?', require('./thread'));
    router.get('/section/:id?/:type?/:order?', require('./section'));
    router.get('/thread/:type?/:order?', require('./thread'));
    router.get('/user/:id/posts', require('./user/post'));
    router.get('/user/:id/threads', require('./user/thread'));
};
