module.exports = (router) => {
    router.get('/contest', require('./contest'));
    router.get('/daily/:id?', require('./daily'));
    router.get('/user/feed/:uid', require('./userFeed'));
    router.get('/user/blog/:username', require('./userBlog'));
};
