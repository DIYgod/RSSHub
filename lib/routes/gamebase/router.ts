export default (router) => {
    router.get('/news/:type?/:category?', './news');
};
