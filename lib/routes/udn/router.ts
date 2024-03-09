export default (router) => {
    router.get('/global/tag/:tag?', './global/tag');
    router.get('/global/:category?', './global/index');
    router.get('/news/breakingnews/:id', './breaking-news');
};
