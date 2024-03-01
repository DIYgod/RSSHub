export default (router) => {
    router.get('/apps/:lang?/card/:id', './apps/card');
    router.get('/apps/:lang?/comment/:id', './apps/comment');
    router.get('/apps/:lang?/note/:id', './apps/note');
    router.get('/apps/:lang?/post/:id', './apps/post');
    router.get('/news/:lang?', './news');
    router.get('/notes/:lang?/note/:id', './notes/note');
    router.get('/notes/:lang?/topic/:topic', './notes/topic');
    router.get('/notes/:lang?/user/:uid', './notes/user');
    router.get('/user/:lang?/appComment/:uid', './user/app-comment');
};
