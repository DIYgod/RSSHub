module.exports = (router) => {
    router.get('/activity/:slug', require('./activity'));
    router.get('/author/:id', require('./author'));
    router.get('/column/:id', require('./column'));
    router.get('/index', require('./index'));
    router.get('/matrix', require('./matrix'));
    router.get('/series', require('./series'));
    router.get('/series/:id', require('./seriesUpdate'));
    router.get('/shortcuts', require('./shortcutsGallery'));
    router.get('/tag/:keyword', require('./tag'));
    router.get('/topic/:id', require('./topic'));
    router.get('/topics', require('./topics'));
};
