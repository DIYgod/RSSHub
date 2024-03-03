export default (router) => {
    router.get('/news/', './news');
    router.get('/news/:path{.+}', './news');
};
