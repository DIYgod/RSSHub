export default (router) => {
    router.get('/blog/:id', './blog');
    router.get('/index', './index');
    router.get('/user/:id', './blog');
    router.get('/:category?', './index');
};
