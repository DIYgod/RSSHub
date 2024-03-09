export default (router) => {
    router.get('/', './category');
    router.get('/category/:category', './category');
    router.get('/tag/:tag', './tag');
    router.get('/topic/:topic', './topic');
};
