export default (router) => {
    router.get('/news/:type', './news/index');
    router.get('/sme/', './sme');
    router.get('/sme/:path{.+}', './sme');
};
