export default (router) => {
    router.get('/knowledge/:topic?/:type?', './knowledge');
    router.get('/list/:category?', './list');
    router.get('/user/:id/:type?', './user');
    router.get('/:category?', './index');
};
