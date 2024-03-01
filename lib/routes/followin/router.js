export default (router) => {
    router.get('/kol/:kolId/:lang?', './kol');
    router.get('/news/:lang?', './news');
    router.get('/tag/:tagId/:lang?', './tag');
    router.get('/topic/:topicId/:lang?', './topic');
    router.get('/:categoryId?/:lang?', './index');
};
