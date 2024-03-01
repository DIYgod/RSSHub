export default (router) => {
    router.get('/article/:categoryId/:sortType?/:timeRange?', './article');
    router.get('/bangumi/:id', './bangumi');
    router.get('/user/video/:uid', './video');
};
