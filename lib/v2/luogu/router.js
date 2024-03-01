module.exports = (router) => {
    router.get('/contest', require('./contest'));
    router.get('/daily/:id?', require('./daily'));
    router.get('/user/feed/:uid', require('./user-feed'));
    router.get('/user/blog/:name', require('./user-blog'));
};
