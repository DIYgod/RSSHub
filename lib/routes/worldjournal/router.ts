export default (router) => {
    router.get('/', './index');
    router.get('/:path{.+}', './index');
};
