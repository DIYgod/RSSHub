module.exports = (router) => {
    router.get('/', './index');
    router.get('/category/:cate', './category');
};
