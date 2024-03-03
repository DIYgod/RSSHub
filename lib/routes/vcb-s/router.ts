export default (router) => {
    router.get('/', './index');
    router.get('/category/:cate', './category');
};
