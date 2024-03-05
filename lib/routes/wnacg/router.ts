export default (router) => {
    router.get('/', './index');
    router.get('/category/:cid', './index');
    router.get('/tag/:tag', './index');
};
