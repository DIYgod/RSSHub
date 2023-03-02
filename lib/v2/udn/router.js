module.exports = (router) => {
    router.get('/global/tag/:tag?', require('./global/tag'));
    router.get('/global/:category?', require('./global/index'));
    router.get('/news/breakingnews/:id', require('./breaking-news'));
};
