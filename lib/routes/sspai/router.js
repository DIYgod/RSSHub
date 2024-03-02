export default (router) => {
    router.get('/activity/:slug', './activity');
    router.get('/author/:id', './author');
    router.get('/bookmarks/:slug', './bookmarks');
    router.get('/column/:id', './column');
    router.get('/index', './index');
    router.get('/matrix', './matrix');
    router.get('/series', './series');
    router.get('/series/:id', './series-update');
    router.get('/shortcuts', './shortcuts-gallery');
    router.get('/tag/:keyword', './tag');
    router.get('/topic/:id', './topic');
    router.get('/topics', './topics');
};
