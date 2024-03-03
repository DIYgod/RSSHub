export default (router) => {
    router.get('/', './news');
    router.get('/:path{.+}', './news');
};
