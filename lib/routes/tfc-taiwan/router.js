export default (router) => {
    router.get('/', './index');
    router.get('/category/:id+', './index');
    router.get('/info', './index');
    router.get('/report', './index');
    router.get('/topic/:id', './index');
};
