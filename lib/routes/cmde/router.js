export default (router) => {
    router.get('/', './index');
    router.get('/:cate{.+}', './index');
};
