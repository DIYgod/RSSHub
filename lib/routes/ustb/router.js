export default (router) => {
    router.get('/tj/news/:type?', './tj/news');
    router.get('/yjsy/news/:type', './yjsy/news');
    router.get('/yzxc/tzgg', './yzxc/tzgg');
};
