module.exports = (router) => {
    router.get('/apps/:lang?/card/:id', require('./apps/card'));
    router.get('/apps/:lang?/comment/:id', require('./apps/comment'));
    router.get('/apps/:lang?/note/:id', require('./apps/note'));
    router.get('/apps/:lang?/post/:id', require('./apps/post'));
    router.get('/news/:lang?', require('./news'));
    router.get('/notes/:lang?/note/:id', require('./notes/note'));
    router.get('/notes/:lang?/topic/:topic', require('./notes/topic'));
    router.get('/notes/:lang?/user/:uid', require('./notes/user'));
    router.get('/user/:lang?/appComment/:uid', require('./user/appComment'));
};
